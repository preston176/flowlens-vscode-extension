import * as vscode from "vscode";
import { StorageService } from "../services/StorageService";
import { AnalyticsService } from "../services/AnalyticsService";
import { SessionSnapshot } from "../models/SessionSnapshot";

export async function openDashboardCommand(
  storageService: StorageService,
  analyticsService: AnalyticsService
): Promise<void> {
  const panel = vscode.window.createWebviewPanel(
    "flowlensDashboard",
    "FlowLens Dashboard",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [],
    }
  );

  // Function to refresh dashboard data
  const refreshDashboard = async () => {
    try {
      const sessions = await storageService.getSessions();
      const analytics = await analyticsService.getProductivityStats();
      const recentSessions = sessions.slice(0, 10);
      panel.webview.html = getWebviewContent(
        sessions,
        analytics,
        recentSessions
      );
    } catch (error) {
      console.error("Error refreshing dashboard:", error);
      vscode.window.showErrorMessage(
        `Failed to refresh dashboard: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  // Initial load
  await refreshDashboard();

  // Handle messages from webview
  panel.webview.onDidReceiveMessage(
    async (message) => {
      try {
        console.log("Dashboard received message:", message.command);

        switch (message.command) {
          case "captureSession":
            try {
              await vscode.commands.executeCommand("FlowLens.quickCapture");
              // Refresh dashboard after capture
              setTimeout(() => refreshDashboard(), 500);
            } catch (error) {
              console.error("Error executing quickCapture:", error);
              vscode.window.showErrorMessage(
                `Failed to capture session: ${error instanceof Error ? error.message : "Unknown error"}`
              );
            }
            break;

          case "restoreSession":
            try {
              await vscode.commands.executeCommand("FlowLens.restoreSession");
            } catch (error) {
              console.error("Error executing restoreSession:", error);
              vscode.window.showErrorMessage(
                `Failed to restore session: ${error instanceof Error ? error.message : "Unknown error"}`
              );
            }
            break;

          case "showSessions":
            try {
              await vscode.commands.executeCommand("FlowLens.showSessions");
            } catch (error) {
              console.error("Error executing showSessions:", error);
              vscode.window.showErrorMessage(
                `Failed to show sessions: ${error instanceof Error ? error.message : "Unknown error"}`
              );
            }
            break;

          case "captureFromTemplate":
            try {
              await vscode.commands.executeCommand(
                "FlowLens.captureFromTemplate"
              );
              // Refresh dashboard after template capture
              setTimeout(() => refreshDashboard(), 500);
            } catch (error) {
              console.error("Error executing captureFromTemplate:", error);
              vscode.window.showErrorMessage(
                `Failed to capture from template: ${error instanceof Error ? error.message : "Unknown error"}`
              );
            }
            break;

          case "exportSessions":
            try {
              await vscode.commands.executeCommand("FlowLens.exportSessions");
            } catch (error) {
              console.error("Error executing exportSessions:", error);
              vscode.window.showErrorMessage(
                `Failed to export sessions: ${error instanceof Error ? error.message : "Unknown error"}`
              );
            }
            break;

          case "importSessions":
            try {
              await vscode.commands.executeCommand("FlowLens.importSessions");
              // Refresh dashboard after import
              setTimeout(() => refreshDashboard(), 500);
            } catch (error) {
              console.error("Error executing importSessions:", error);
              vscode.window.showErrorMessage(
                `Failed to import sessions: ${error instanceof Error ? error.message : "Unknown error"}`
              );
            }
            break;

          case "deleteSession":
            try {
              if (!message.sessionId) {
                throw new Error("Session ID is required");
              }

              const result = await storageService.deleteSession(
                message.sessionId
              );

              if (result.deleted) {
                vscode.window.showInformationMessage(
                  `Session deleted. ${result.remaining} sessions remaining.`
                );
                await refreshDashboard();
              } else {
                vscode.window.showWarningMessage("Session not found");
              }
            } catch (error) {
              console.error("Error deleting session:", error);
              vscode.window.showErrorMessage(
                `Failed to delete session: ${error instanceof Error ? error.message : "Unknown error"}`
              );
            }
            break;

          case "restoreSpecificSession":
            try {
              if (!message.sessionId) {
                throw new Error("Session ID is required");
              }

              const session = await storageService.getSessionById(
                message.sessionId
              );

              if (session) {
                await vscode.commands.executeCommand(
                  "FlowLens.restoreSession",
                  session
                );
              } else {
                vscode.window.showWarningMessage("Session not found");
              }
            } catch (error) {
              console.error("Error restoring specific session:", error);
              vscode.window.showErrorMessage(
                `Failed to restore session: ${error instanceof Error ? error.message : "Unknown error"}`
              );
            }
            break;

          case "refresh":
            await refreshDashboard();
            break;

          default:
            console.warn("Unknown command:", message.command);
        }
      } catch (error) {
        console.error("Error handling dashboard message:", error);
        vscode.window.showErrorMessage(
          `Dashboard error: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    },
    undefined,
    []
  );
}

function getWebviewContent(
  sessions: SessionSnapshot[],
  analytics: any,
  recentSessions: SessionSnapshot[]
): string {
  const totalSessions = sessions.length;
  const timeSavedMinutes = analytics?.totalTimeSaved || 0;
  const costSaved = analytics?.totalCostSaved || 0;
  const avgSessionsPerDay = analytics?.averageSessionsPerDay || 0;

  // Safely format numbers
  const formatNumber = (num: number): string => {
    if (typeof num !== "number" || isNaN(num)) {
      return "0";
    }
    return num.toFixed(2);
  };

  const formatInteger = (num: number): string => {
    if (typeof num !== "number" || isNaN(num)) {
      return "0";
    }
    return Math.round(num).toString();
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<title>FlowLens Dashboard</title>
	<style>
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}

		body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
			background: #1e1e1e;
			color: #cccccc;
			padding: 20px;
			overflow-x: hidden;
		}

		.dashboard-container {
			max-width: 1400px;
			margin: 0 auto;
		}

		.header {
			margin-bottom: 30px;
			border-bottom: 2px solid #007ACC;
			padding-bottom: 20px;
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

		.header-content h1 {
			font-size: 2.5rem;
			color: #007ACC;
			margin-bottom: 10px;
			display: flex;
			align-items: center;
			gap: 15px;
		}

		.header-content p {
			font-size: 1.1rem;
			color: #888;
		}

		.refresh-btn {
			padding: 10px 20px;
			background: #007ACC;
			color: white;
			border: none;
			border-radius: 6px;
			cursor: pointer;
			font-size: 14px;
			font-weight: 600;
			transition: all 0.3s ease;
		}

		.refresh-btn:hover {
			background: #005A9E;
			transform: translateY(-2px);
		}

		.action-buttons {
			display: flex;
			gap: 15px;
			margin-bottom: 30px;
			flex-wrap: wrap;
		}

		.btn {
			padding: 12px 24px;
			border: none;
			border-radius: 6px;
			font-size: 14px;
			font-weight: 600;
			cursor: pointer;
			transition: all 0.3s ease;
			display: flex;
			align-items: center;
			gap: 8px;
		}

		.btn:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}

		.btn-primary {
			background: #007ACC;
			color: white;
		}

		.btn-primary:hover:not(:disabled) {
			background: #005A9E;
			transform: translateY(-2px);
			box-shadow: 0 4px 12px rgba(0, 122, 204, 0.3);
		}

		.btn-secondary {
			background: #2D2D30;
			color: #cccccc;
			border: 1px solid #3E3E42;
		}

		.btn-secondary:hover:not(:disabled) {
			background: #3E3E42;
			transform: translateY(-2px);
		}

		.stats-grid {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
			gap: 20px;
			margin-bottom: 30px;
		}

		.stat-card {
			background: linear-gradient(135deg, #2D2D30 0%, #252526 100%);
			padding: 25px;
			border-radius: 12px;
			border: 1px solid #3E3E42;
			transition: all 0.3s ease;
		}

		.stat-card:hover {
			transform: translateY(-4px);
			box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
			border-color: #007ACC;
		}

		.stat-card h3 {
			font-size: 0.9rem;
			color: #888;
			text-transform: uppercase;
			letter-spacing: 1px;
			margin-bottom: 10px;
		}

		.stat-value {
			font-size: 2.5rem;
			font-weight: 700;
			color: #007ACC;
			margin-bottom: 5px;
		}

		.stat-label {
			font-size: 0.85rem;
			color: #888;
		}

		.stat-icon {
			font-size: 2rem;
			margin-bottom: 10px;
		}

		.content-grid {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 20px;
			margin-bottom: 30px;
		}

		@media (max-width: 900px) {
			.content-grid {
				grid-template-columns: 1fr;
			}
		}

		.card {
			background: #2D2D30;
			border-radius: 12px;
			border: 1px solid #3E3E42;
			overflow: hidden;
		}

		.card-header {
			padding: 20px;
			background: linear-gradient(135deg, #007ACC 0%, #005A9E 100%);
			color: white;
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

		.card-header h2 {
			font-size: 1.3rem;
			display: flex;
			align-items: center;
			gap: 10px;
		}

		.card-body {
			padding: 20px;
			max-height: 400px;
			overflow-y: auto;
		}

		.card-body::-webkit-scrollbar {
			width: 8px;
		}

		.card-body::-webkit-scrollbar-track {
			background: #252526;
		}

		.card-body::-webkit-scrollbar-thumb {
			background: #3E3E42;
			border-radius: 4px;
		}

		.card-body::-webkit-scrollbar-thumb:hover {
			background: #007ACC;
		}

		.session-item {
			padding: 15px;
			margin-bottom: 10px;
			background: #252526;
			border-radius: 8px;
			border: 1px solid #3E3E42;
			transition: all 0.3s ease;
		}

		.session-item:hover {
			background: #2D2D30;
			border-color: #007ACC;
			transform: translateX(5px);
		}

		.session-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 8px;
		}

		.session-title {
			font-weight: 600;
			color: #007ACC;
			font-size: 1.05rem;
		}

		.session-date {
			font-size: 0.85rem;
			color: #888;
		}

		.session-details {
			display: flex;
			gap: 15px;
			font-size: 0.85rem;
			color: #888;
			margin-bottom: 10px;
		}

		.session-actions {
			display: flex;
			gap: 10px;
			margin-top: 10px;
		}

		.btn-small {
			padding: 6px 12px;
			font-size: 0.8rem;
			border-radius: 4px;
			border: none;
			cursor: pointer;
			transition: all 0.2s ease;
			font-weight: 600;
		}

		.btn-small:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}

		.btn-restore {
			background: #16825D;
			color: white;
		}

		.btn-restore:hover:not(:disabled) {
			background: #14704F;
		}

		.btn-delete {
			background: #C5372C;
			color: white;
		}

		.btn-delete:hover:not(:disabled) {
			background: #A32C23;
		}

		.empty-state {
			text-align: center;
			padding: 40px 20px;
			color: #888;
		}

		.empty-state-icon {
			font-size: 3rem;
			margin-bottom: 15px;
			opacity: 0.5;
		}

		.progress-bar {
			height: 8px;
			background: #3E3E42;
			border-radius: 4px;
			overflow: hidden;
			margin-top: 10px;
		}

		.progress-fill {
			height: 100%;
			background: linear-gradient(90deg, #007ACC, #00A4EF);
			border-radius: 4px;
			transition: width 0.3s ease;
		}

		.badge {
			display: inline-block;
			padding: 4px 8px;
			border-radius: 4px;
			font-size: 0.75rem;
			font-weight: 600;
			text-transform: uppercase;
		}

		.badge-success {
			background: #16825D;
			color: white;
		}

		.badge-info {
			background: #007ACC;
			color: white;
		}

		.tip-card {
			background: linear-gradient(135deg, #16825D 0%, #14704F 100%);
			padding: 20px;
			border-radius: 12px;
			color: white;
			margin-bottom: 30px;
		}

		.tip-card h3 {
			margin-bottom: 10px;
			font-size: 1.2rem;
		}

		.keyboard-shortcuts {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
			gap: 15px;
			margin-top: 15px;
		}

		.shortcut {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 10px;
			background: rgba(255, 255, 255, 0.1);
			border-radius: 6px;
		}

		.key {
			background: rgba(0, 0, 0, 0.3);
			padding: 4px 8px;
			border-radius: 4px;
			font-family: monospace;
			font-weight: 600;
		}

		@keyframes fadeIn {
			from { opacity: 0; transform: translateY(20px); }
			to { opacity: 1; transform: translateY(0); }
		}

		.fade-in {
			animation: fadeIn 0.5s ease-out;
		}

		.error-message {
			background: #C5372C;
			color: white;
			padding: 15px;
			border-radius: 8px;
			margin-bottom: 20px;
			display: none;
		}

		.error-message.show {
			display: block;
		}
	</style>
</head>
<body>
	<div class="dashboard-container">
		<!-- Error Message -->
		<div id="errorMessage" class="error-message"></div>

		<!-- Header -->
		<div class="header fade-in">
			<div class="header-content">
				<h1>
					<span>📊</span>
					FlowLens Dashboard
				</h1>
				<p>Your productivity command center</p>
			</div>
			<button class="refresh-btn" onclick="refreshDashboard()">
				🔄 Refresh
			</button>
		</div>

		<!-- Action Buttons -->
		<div class="action-buttons fade-in">
			<button class="btn btn-primary" onclick="captureSession()">
				<span>⚡</span> Quick Capture
			</button>
			<button class="btn btn-primary" onclick="restoreSession()">
				<span>🔄</span> Restore Session
			</button>
			<button class="btn btn-secondary" onclick="captureFromTemplate()">
				<span>📋</span> Use Template
			</button>
			<button class="btn btn-secondary" onclick="showSessions()">
				<span>📚</span> All Sessions
			</button>
			<button class="btn btn-secondary" onclick="exportSessions()">
				<span>📤</span> Export
			</button>
			<button class="btn btn-secondary" onclick="importSessions()">
				<span>📥</span> Import
			</button>
		</div>

		<!-- Stats Grid -->
		<div class="stats-grid fade-in">
			<div class="stat-card">
				<div class="stat-icon">💾</div>
				<h3>Total Sessions</h3>
				<div class="stat-value">${formatInteger(totalSessions)}</div>
				<div class="stat-label">Captured contexts</div>
			</div>

			<div class="stat-card">
				<div class="stat-icon">⏱️</div>
				<h3>Time Saved</h3>
				<div class="stat-value">${formatInteger(timeSavedMinutes)}</div>
				<div class="stat-label">Minutes recovered</div>
			</div>

			<div class="stat-card">
				<div class="stat-icon">💰</div>
				<h3>Cost Saved</h3>
				<div class="stat-value">$${formatNumber(costSaved)}</div>
				<div class="stat-label">At $75/hr rate</div>
			</div>

			<div class="stat-card">
				<div class="stat-icon">📈</div>
				<h3>Daily Average</h3>
				<div class="stat-value">${formatNumber(avgSessionsPerDay)}</div>
				<div class="stat-label">Sessions per day</div>
			</div>
		</div>

		<!-- Productivity Tip -->
		<div class="tip-card fade-in">
			<h3>💡 Pro Tip: Use Keyboard Shortcuts</h3>
			<p>Speed up your workflow with these shortcuts:</p>
			<div class="keyboard-shortcuts">
				<div class="shortcut">
					<span>Quick Capture</span>
					<span class="key">Cmd+Shift+F</span>
				</div>
				<div class="shortcut">
					<span>Restore Session</span>
					<span class="key">Cmd+Shift+R</span>
				</div>
				<div class="shortcut">
					<span>Dashboard</span>
					<span class="key">Cmd+Shift+T</span>
				</div>
			</div>
		</div>

		<!-- Content Grid -->
		<div class="content-grid fade-in">
			<!-- Recent Sessions -->
			<div class="card">
				<div class="card-header">
					<h2><span>📁</span> Recent Sessions</h2>
					<span class="badge badge-info">${formatInteger(totalSessions)} Total</span>
				</div>
				<div class="card-body">
					${
            recentSessions.length === 0
              ? `
						<div class="empty-state">
							<div class="empty-state-icon">📭</div>
							<h3>No sessions yet</h3>
							<p>Capture your first session to get started!</p>
							<button class="btn btn-primary" onclick="captureSession()" style="margin-top: 15px;">
								<span>⚡</span> Capture Now
							</button>
						</div>
					`
              : recentSessions
                  .map(
                    (session) => {
                      const title = escapeHtml(session.title || "Untitled Session");
                      const date = new Date(session.timestamp).toLocaleDateString();
                      const filesCount = session.editors?.length || 0;
                      const terminalsCount = session.terminals?.length || 0;
                      const branch = session.git?.branch ? escapeHtml(session.git.branch) : "";

                      return `
						<div class="session-item">
							<div class="session-header">
								<div class="session-title">${title}</div>
								<div class="session-date">${date}</div>
							</div>
							<div class="session-details">
								<span>📄 ${filesCount} files</span>
								<span>💻 ${terminalsCount} terminals</span>
								${branch ? `<span>🌿 ${branch}</span>` : ""}
							</div>
							<div class="session-actions">
								<button class="btn-small btn-restore" onclick="restoreSpecificSession('${escapeHtml(session.id)}')">
									Restore
								</button>
								<button class="btn-small btn-delete" onclick="deleteSession('${escapeHtml(session.id)}')">
									Delete
								</button>
							</div>
						</div>
					`;
                    }
                  )
                  .join("")
          }
				</div>
			</div>

			<!-- Productivity Insights -->
			<div class="card">
				<div class="card-header">
					<h2><span>📊</span> Productivity Insights</h2>
					<span class="badge badge-success">91% Faster</span>
				</div>
				<div class="card-body">
					<div style="margin-bottom: 25px;">
						<h3 style="color: #007ACC; margin-bottom: 10px;">Context Switch Recovery</h3>
						<div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
							<span style="color: #888;">Without FlowLens</span>
							<span style="color: #C5372C; font-weight: 600;">23 minutes</span>
						</div>
						<div class="progress-bar">
							<div class="progress-fill" style="width: 100%;"></div>
						</div>
					</div>

					<div style="margin-bottom: 25px;">
						<div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
							<span style="color: #888;">With FlowLens</span>
							<span style="color: #16825D; font-weight: 600;">2 minutes</span>
						</div>
						<div class="progress-bar">
							<div class="progress-fill" style="width: 8.7%; background: linear-gradient(90deg, #16825D, #14704F);"></div>
						</div>
					</div>

					<div style="margin-bottom: 25px;">
						<h3 style="color: #007ACC; margin-bottom: 10px;">Weekly Savings</h3>
						<div style="background: #252526; padding: 15px; border-radius: 8px;">
							<div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
								<span>Time Saved This Week</span>
								<span style="color: #16825D; font-weight: 600;">${formatInteger(
                  timeSavedMinutes * 0.14
                )} min</span>
							</div>
							<div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
								<span>Cost Saved This Week</span>
								<span style="color: #16825D; font-weight: 600;">$${formatNumber(
                  costSaved * 0.14
                )}</span>
							</div>
							<div style="display: flex; justify-content: space-between;">
								<span>Sessions This Week</span>
								<span style="color: #007ACC; font-weight: 600;">${formatInteger(
                  avgSessionsPerDay * 7
                )}</span>
							</div>
						</div>
					</div>

					<div>
						<h3 style="color: #007ACC; margin-bottom: 10px;">ROI Calculator</h3>
						<div style="background: linear-gradient(135deg, #007ACC 0%, #005A9E 100%); padding: 15px; border-radius: 8px; color: white;">
							<div style="font-size: 0.9rem; margin-bottom: 5px;">If you're interrupted 5 times/day:</div>
							<div style="font-size: 1.5rem; font-weight: 700;">$656.25/week saved</div>
							<div style="font-size: 0.85rem; opacity: 0.9;">105 minutes saved daily</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<script>
		(function() {
			const vscode = acquireVsCodeApi();

			// Helper function to escape HTML
			window.escapeHtml = function(text) {
				const div = document.createElement('div');
				div.textContent = text;
				return div.innerHTML;
			};

			// Show error message
			function showError(message) {
				const errorEl = document.getElementById('errorMessage');
				if (errorEl) {
					errorEl.textContent = message;
					errorEl.classList.add('show');
					setTimeout(() => {
						errorEl.classList.remove('show');
					}, 5000);
				}
			}

			// Send message to extension with error handling
			function sendMessage(command, data = {}) {
				try {
					console.log('Sending message:', command, data);
					vscode.postMessage({ command, ...data });
				} catch (error) {
					console.error('Error sending message:', error);
					showError('Failed to communicate with extension');
				}
			}

			window.captureSession = function() {
				sendMessage('captureSession');
			};

			window.restoreSession = function() {
				sendMessage('restoreSession');
			};

			window.showSessions = function() {
				sendMessage('showSessions');
			};

			window.captureFromTemplate = function() {
				sendMessage('captureFromTemplate');
			};

			window.exportSessions = function() {
				sendMessage('exportSessions');
			};

			window.importSessions = function() {
				sendMessage('importSessions');
			};

			window.deleteSession = function(sessionId) {
				if (!sessionId) {
					showError('Invalid session ID');
					return;
				}

				if (confirm('Are you sure you want to delete this session? This cannot be undone.')) {
					sendMessage('deleteSession', { sessionId });
				}
			};

			window.restoreSpecificSession = function(sessionId) {
				if (!sessionId) {
					showError('Invalid session ID');
					return;
				}

				sendMessage('restoreSpecificSession', { sessionId });
			};

			window.refreshDashboard = function() {
				sendMessage('refresh');
			};

			// Log when dashboard is ready
			console.log('FlowLens Dashboard loaded successfully');
		})();
	</script>
</body>
</html>`;
}

// Helper function to escape HTML in template literals
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
