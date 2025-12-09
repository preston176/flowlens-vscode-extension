import * as vscode from "vscode";
import { StorageService } from "../services/StorageService";
import { AnalyticsService } from "../services/AnalyticsService";

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

  // Get data
  const sessions = await storageService.getSessions();
  const analytics = await analyticsService.getProductivityStats();
  const recentSessions = sessions.slice(0, 10);

  panel.webview.html = getWebviewContent(sessions, analytics, recentSessions);

  // Handle messages from webview
  panel.webview.onDidReceiveMessage(
    async (message) => {
      switch (message.command) {
        case "captureSession":
          await vscode.commands.executeCommand("FlowLens.quickCapture");
          break;
        case "restoreSession":
          await vscode.commands.executeCommand("FlowLens.restoreSession");
          break;
        case "showSessions":
          await vscode.commands.executeCommand("FlowLens.showSessions");
          break;
        case "captureFromTemplate":
          await vscode.commands.executeCommand("FlowLens.captureFromTemplate");
          break;
        case "exportSessions":
          await vscode.commands.executeCommand("FlowLens.exportSessions");
          break;
        case "importSessions":
          await vscode.commands.executeCommand("FlowLens.importSessions");
          break;
        case "deleteSession":
          await storageService.deleteSession(message.sessionId);
          // Refresh dashboard
          const updatedSessions = await storageService.getSessions();
          const updatedAnalytics =
            await analyticsService.getProductivityStats();
          const updatedRecent = updatedSessions.slice(0, 10);
          panel.webview.html = getWebviewContent(
            updatedSessions,
            updatedAnalytics,
            updatedRecent
          );
          break;
        case "restoreSpecificSession":
          const session = await storageService.getSessionById(
            message.sessionId
          );
          if (session) {
            await vscode.commands.executeCommand(
              "FlowLens.restoreSession",
              session
            );
          }
          break;
      }
    },
    undefined,
    []
  );
}

function getWebviewContent(
  sessions: any[],
  analytics: any,
  recentSessions: any[]
): string {
  const totalSessions = sessions.length;
  const timeSavedMinutes = analytics.totalTimeSaved || 0;
  const costSaved = analytics.totalCostSaved || 0;
  const avgSessionsPerDay = analytics.averageSessionsPerDay || 0;

  return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
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
		}

		.header h1 {
			font-size: 2.5rem;
			color: #007ACC;
			margin-bottom: 10px;
			display: flex;
			align-items: center;
			gap: 15px;
		}

		.header p {
			font-size: 1.1rem;
			color: #888;
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

		.btn-primary {
			background: #007ACC;
			color: white;
		}

		.btn-primary:hover {
			background: #005A9E;
			transform: translateY(-2px);
			box-shadow: 0 4px 12px rgba(0, 122, 204, 0.3);
		}

		.btn-secondary {
			background: #2D2D30;
			color: #cccccc;
			border: 1px solid #3E3E42;
		}

		.btn-secondary:hover {
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
			cursor: pointer;
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
		}

		.btn-restore {
			background: #16825D;
			color: white;
		}

		.btn-restore:hover {
			background: #14704F;
		}

		.btn-delete {
			background: #C5372C;
			color: white;
		}

		.btn-delete:hover {
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

		.chart-container {
			margin-top: 20px;
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

		.badge-warning {
			background: #FF8C00;
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
	</style>
</head>
<body>
	<div class="dashboard-container">
		<!-- Header -->
		<div class="header fade-in">
			<h1>
				<span>📊</span>
				FlowLens Dashboard
			</h1>
			<p>Your productivity command center</p>
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
				<div class="stat-value">${totalSessions}</div>
				<div class="stat-label">Captured contexts</div>
			</div>

			<div class="stat-card">
				<div class="stat-icon">⏱️</div>
				<h3>Time Saved</h3>
				<div class="stat-value">${timeSavedMinutes}</div>
				<div class="stat-label">Minutes recovered</div>
			</div>

			<div class="stat-card">
				<div class="stat-icon">💰</div>
				<h3>Cost Saved</h3>
				<div class="stat-value">$${costSaved.toFixed(2)}</div>
				<div class="stat-label">At $75/hr rate</div>
			</div>

			<div class="stat-card">
				<div class="stat-icon">📈</div>
				<h3>Daily Average</h3>
				<div class="stat-value">${avgSessionsPerDay.toFixed(1)}</div>
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
					<span class="badge badge-info">${totalSessions} Total</span>
				</div>
				<div class="card-body">
					${
            recentSessions.length === 0
              ? `
						<div class="empty-state">
							<div class="empty-state-icon">📭</div>
							<h3>No sessions yet</h3>
							<p>Capture your first session to get started!</p>
						</div>
					`
              : recentSessions
                  .map(
                    (session) => `
						<div class="session-item">
							<div class="session-header">
								<div class="session-title">${session.title || "Untitled Session"}</div>
								<div class="session-date">${new Date(
                  session.timestamp
                ).toLocaleDateString()}</div>
							</div>
							<div class="session-details">
								<span>📄 ${session.editors?.length || 0} files</span>
								<span>💻 ${session.terminals?.length || 0} terminals</span>
								${session.git?.branch ? `<span>🌿 ${session.git.branch}</span>` : ""}
							</div>
							<div class="session-actions">
								<button class="btn-small btn-restore" onclick="restoreSpecificSession('${
                  session.id
                }')">
									Restore
								</button>
								<button class="btn-small btn-delete" onclick="deleteSession('${session.id}')">
									Delete
								</button>
							</div>
						</div>
					`
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
								<span style="color: #16825D; font-weight: 600;">${(
                  timeSavedMinutes * 7
                ).toFixed(0)} min</span>
							</div>
							<div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
								<span>Cost Saved This Week</span>
								<span style="color: #16825D; font-weight: 600;">$${(costSaved * 7).toFixed(
                  2
                )}</span>
							</div>
							<div style="display: flex; justify-content: space-between;">
								<span>Sessions This Week</span>
								<span style="color: #007ACC; font-weight: 600;">${Math.ceil(
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
		const vscode = acquireVsCodeApi();

		function captureSession() {
			vscode.postMessage({ command: 'captureSession' });
		}

		function restoreSession() {
			vscode.postMessage({ command: 'restoreSession' });
		}

		function showSessions() {
			vscode.postMessage({ command: 'showSessions' });
		}

		function captureFromTemplate() {
			vscode.postMessage({ command: 'captureFromTemplate' });
		}

		function exportSessions() {
			vscode.postMessage({ command: 'exportSessions' });
		}

		function importSessions() {
			vscode.postMessage({ command: 'importSessions' });
		}

		function deleteSession(sessionId) {
			if (confirm('Are you sure you want to delete this session?')) {
				vscode.postMessage({ command: 'deleteSession', sessionId });
			}
		}

		function restoreSpecificSession(sessionId) {
			vscode.postMessage({ command: 'restoreSpecificSession', sessionId });
		}
	</script>
</body>
</html>`;
}
