import * as vscode from 'vscode';
import * as path from 'path';
import { SessionSnapshot, SESSIONS_KEY, WorkspaceInfo } from '../models/SessionSnapshot';

export class StorageService {
	constructor(private readonly context: vscode.ExtensionContext) {}

	async getSessions(): Promise<SessionSnapshot[]> {
		return this.context.globalState.get(SESSIONS_KEY, []);
	}

	async getSessionsByWorkspace(workspace: WorkspaceInfo | undefined): Promise<SessionSnapshot[]> {
		const allSessions = await this.getSessions();

		if (!workspace) {
			return allSessions.filter(s => !s.workspace);
		}

		return allSessions.filter(s => {
			if (!s.workspace) {
				return false;
			}
			return path.normalize(s.workspace.path) === path.normalize(workspace.path);
		});
	}

	async saveSession(session: SessionSnapshot): Promise<void> {
		const existing = await this.getSessions();
		existing.unshift(session);
		await this.context.globalState.update(SESSIONS_KEY, existing.slice(0, 50));
	}

	async deleteSession(id: string): Promise<{ deleted: boolean; remaining: number }> {
		let sessions = await this.getSessions();
		const before = sessions.length;
		sessions = sessions.filter(s => s.id !== id);
		await this.context.globalState.update(SESSIONS_KEY, sessions);

		return {
			deleted: before !== sessions.length,
			remaining: sessions.length
		};
	}

	async getSessionById(id: string): Promise<SessionSnapshot | undefined> {
		const sessions = await this.getSessions();
		return sessions.find(s => s.id === id);
	}
}
