import * as vscode from 'vscode';
import { StorageService } from './StorageService';
import { GitService } from './GitService';
import { EditorService } from './EditorService';
import { WorkspaceService } from './WorkspaceService';
import { SmartNamingService } from './SmartNamingService';
import { SessionSnapshot } from '../models/SessionSnapshot';

export interface AutoCaptureConfig {
	enabled: boolean;
	onBranchSwitch: boolean;
	onIdleTime: boolean;
	idleMinutes: number;
	onWorkspaceFolderChange: boolean;
	maxAutoCaptures: number;
}

/**
 * AutoCaptureService monitors VS Code events and automatically captures sessions
 */
export class AutoCaptureService {
	private disposables: vscode.Disposable[] = [];
	private idleTimer: NodeJS.Timeout | null = null;
	private lastActivityTime: number = Date.now();
	private currentBranch: string | null | undefined;
	private autoCaptureCount: number = 0;

	constructor(
		private storageService: StorageService,
		private gitService: GitService,
		private editorService: EditorService,
		private workspaceService: WorkspaceService,
		private smartNaming: SmartNamingService
	) {}

	/**
	 * Start monitoring for auto-capture triggers
	 */
	async start(): Promise<void> {
		const config = this.getConfig();
		
		if (!config.enabled) {
			return;
		}

		// Initialize current branch
		const gitInfo = await this.gitService.captureGitInfo();
		this.currentBranch = gitInfo?.branch;

		// Monitor git branch changes
		if (config.onBranchSwitch) {
			this.startBranchMonitoring();
		}

		// Monitor idle time
		if (config.onIdleTime) {
			this.startIdleMonitoring(config.idleMinutes);
		}

		// Monitor workspace folder changes
		if (config.onWorkspaceFolderChange) {
			this.startWorkspaceMonitoring();
		}

		console.log('FlowLens AutoCapture started');
	}

	/**
	 * Stop all monitoring
	 */
	stop(): void {
		this.disposables.forEach(d => d.dispose());
		this.disposables = [];
		
		if (this.idleTimer) {
			clearInterval(this.idleTimer);
			this.idleTimer = null;
		}
	}

	/**
	 * Get configuration from VS Code settings
	 */
	private getConfig(): AutoCaptureConfig {
		const config = vscode.workspace.getConfiguration('flowlens');
		
		return {
			enabled: config.get('autoCapture.enabled', true),
			onBranchSwitch: config.get('autoCapture.onBranchSwitch', true),
			onIdleTime: config.get('autoCapture.onIdleTime', false),
			idleMinutes: config.get('autoCapture.idleMinutes', 30),
			onWorkspaceFolderChange: config.get('autoCapture.onWorkspaceFolderChange', true),
			maxAutoCaptures: config.get('autoCapture.maxPerDay', 20)
		};
	}

	/**
	 * Monitor for git branch switches
	 */
	private startBranchMonitoring(): void {
		// Check branch every 5 seconds (when user is active)
		const checkBranch = async () => {
			try {
				const gitInfo = await this.gitService.captureGitInfo();
				const newBranch = gitInfo?.branch;

				if (newBranch && this.currentBranch && newBranch !== this.currentBranch) {
					console.log(`Branch switched: ${this.currentBranch} → ${newBranch}`);
					await this.autoCapture(`Before switching to ${newBranch}`, 'branch-switch');
					this.currentBranch = newBranch;
				} else if (newBranch) {
					this.currentBranch = newBranch;
				}
			} catch (error) {
				console.error('Branch monitoring error:', error);
			}
		};

		// Check periodically
		const interval = setInterval(checkBranch, 5000);
		this.disposables.push({ dispose: () => clearInterval(interval) });
	}

	/**
	 * Monitor for idle time
	 */
	private startIdleMonitoring(idleMinutes: number): void {
		// Track user activity
		const updateActivity = () => {
			this.lastActivityTime = Date.now();
		};

		// Listen to various activity events
		this.disposables.push(
			vscode.window.onDidChangeActiveTextEditor(updateActivity),
			vscode.window.onDidChangeTextEditorSelection(updateActivity),
			vscode.workspace.onDidChangeTextDocument(updateActivity),
			vscode.window.onDidChangeTerminalState(updateActivity)
		);

		// Check idle time every minute
		this.idleTimer = setInterval(async () => {
			const idleMs = Date.now() - this.lastActivityTime;
			const idleThresholdMs = idleMinutes * 60 * 1000;

			if (idleMs >= idleThresholdMs) {
				await this.autoCapture('Before idle period', 'idle');
				this.lastActivityTime = Date.now(); // Reset to avoid repeated captures
			}
		}, 60000); // Check every minute
	}

	/**
	 * Monitor workspace folder changes
	 */
	private startWorkspaceMonitoring(): void {
		this.disposables.push(
			vscode.workspace.onDidChangeWorkspaceFolders(async (event) => {
				if (event.added.length > 0 || event.removed.length > 0) {
					await this.autoCapture('Before workspace change', 'workspace-change');
				}
			})
		);
	}

	/**
	 * Perform auto-capture
	 */
	private async autoCapture(reason: string, trigger: string): Promise<void> {
		const config = this.getConfig();

		// Check daily limit
		if (this.autoCaptureCount >= config.maxAutoCaptures) {
			console.log('Auto-capture limit reached for today');
			return;
		}

		try {
			const editors = this.editorService.captureEditors();
			
			// Don't capture if no files are open
			if (editors.length === 0) {
				return;
			}

			const terminals = this.editorService.captureTerminals();
			const git = await this.gitService.captureGitInfo();
			const workspace = this.workspaceService.getCurrentWorkspace();

			// Generate smart name
			const smartTitle = await this.smartNaming.generateSessionName(editors);
			const title = `[Auto] ${smartTitle}`;

			const session: SessionSnapshot = {
				id: `session_${new Date().toISOString()}`,
				title,
				timestamp: new Date().toISOString(),
				editors,
				terminals,
				git,
				notes: `Auto-captured: ${reason} (trigger: ${trigger})`,
				workspace,
			};

			await this.storageService.saveSession(session);
			this.autoCaptureCount++;

			// Show subtle notification
			vscode.window.showInformationMessage(
				`📸 Auto-captured: ${smartTitle}`,
				'View'
			).then(action => {
				if (action === 'View') {
					vscode.commands.executeCommand('FlowLens.showSessions');
				}
			});

		} catch (error) {
			console.error('Auto-capture failed:', error);
		}
	}

	/**
	 * Reset daily counter (call this at midnight or on startup)
	 */
	resetDailyCounter(): void {
		this.autoCaptureCount = 0;
	}
}
