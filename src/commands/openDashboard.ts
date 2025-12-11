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
      const recentSessions = sessions.slice(0, 8);
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

  // Calculate additional metrics
  const timeSavedHours = Math.floor(timeSavedMinutes / 60);
  const timeSavedDays = Math.floor(timeSavedHours / 8);
  const weeklyTimeSaved = Math.round(timeSavedMinutes * 0.14);
  const weeklyCostSaved = costSaved * 0.14;
  const productivityGain = timeSavedMinutes > 0 ? Math.round((timeSavedMinutes / (timeSavedMinutes + totalSessions * 23)) * 100) : 0;

  // Format numbers safely
  const fmt = (num: number, decimals = 0): string => {
    if (typeof num !== "number" || isNaN(num)) {
      return "0";
    }
    return decimals > 0 ? num.toFixed(decimals) : Math.round(num).toString();
  };

  // Get session stats
  const sessionsThisWeek = sessions.filter(s => {
    const sessionDate = new Date(s.timestamp);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sessionDate >= weekAgo;
  }).length;

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

    :root {
      --primary: #007ACC;
      --primary-dark: #005A9E;
      --primary-light: #1E90FF;
      --success: #16825D;
      --success-dark: #14704F;
      --danger: #C5372C;
      --danger-dark: #A32C23;
      --warning: #F59E0B;
      --bg-primary: #1E1E1E;
      --bg-secondary: #252526;
      --bg-tertiary: #2D2D30;
      --border: #3E3E42;
      --text-primary: #CCCCCC;
      --text-secondary: #888888;
      --text-muted: #6E6E6E;
      --card-shadow: rgba(0, 0, 0, 0.3);
      --hover-overlay: rgba(255, 255, 255, 0.05);
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      line-height: 1.6;
      overflow-x: hidden;
    }

    .dashboard {
      max-width: 1600px;
      margin: 0 auto;
      padding: 32px 24px;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--border);
    }

    .header-title h1 {
      font-size: 28px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 4px;
      letter-spacing: -0.5px;
    }

    .header-subtitle {
      font-size: 14px;
      color: var(--text-secondary);
      font-weight: 400;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    /* Buttons */
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary {
      background: var(--primary);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--primary-dark);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 122, 204, 0.4);
    }

    .btn-secondary {
      background: var(--bg-tertiary);
      color: var(--text-primary);
      border: 1px solid var(--border);
    }

    .btn-secondary:hover:not(:disabled) {
      background: var(--border);
      border-color: var(--text-secondary);
    }

    .btn-ghost {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid transparent;
    }

    .btn-ghost:hover:not(:disabled) {
      background: var(--hover-overlay);
      color: var(--text-primary);
      border-color: var(--border);
    }

    .btn-sm {
      padding: 6px 14px;
      font-size: 13px;
    }

    .btn-success {
      background: var(--success);
      color: white;
    }

    .btn-success:hover:not(:disabled) {
      background: var(--success-dark);
    }

    .btn-danger {
      background: var(--danger);
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background: var(--danger-dark);
    }

    /* Action Bar */
    .action-bar {
      display: flex;
      gap: 12px;
      margin-bottom: 32px;
      flex-wrap: wrap;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 24px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--primary), var(--primary-light));
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px var(--card-shadow);
      border-color: var(--primary);
    }

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .stat-title {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: rgba(0, 122, 204, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 8px;
      line-height: 1;
    }

    .stat-label {
      font-size: 13px;
      color: var(--text-muted);
    }

    .stat-trend {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 500;
      margin-top: 8px;
      padding: 4px 8px;
      border-radius: 4px;
      background: rgba(22, 130, 93, 0.1);
      color: var(--success);
    }

    .stat-trend.negative {
      background: rgba(197, 55, 44, 0.1);
      color: var(--danger);
    }

    /* Main Content */
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
    }

    @media (max-width: 1200px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Card */
    .card {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }

    .card-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .card-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      background: rgba(0, 122, 204, 0.1);
      color: var(--primary);
    }

    .card-body {
      padding: 24px;
      max-height: 500px;
      overflow-y: auto;
    }

    .card-body::-webkit-scrollbar {
      width: 6px;
    }

    .card-body::-webkit-scrollbar-track {
      background: var(--bg-secondary);
    }

    .card-body::-webkit-scrollbar-thumb {
      background: var(--border);
      border-radius: 3px;
    }

    .card-body::-webkit-scrollbar-thumb:hover {
      background: var(--text-secondary);
    }

    /* Session Item */
    .session-item {
      padding: 16px;
      margin-bottom: 12px;
      background: var(--bg-tertiary);
      border: 1px solid var(--border);
      border-radius: 6px;
      transition: all 0.2s ease;
    }

    .session-item:last-child {
      margin-bottom: 0;
    }

    .session-item:hover {
      background: var(--bg-primary);
      border-color: var(--primary);
      transform: translateX(4px);
    }

    .session-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .session-title-wrapper {
      flex: 1;
      min-width: 0;
    }

    .session-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .session-date {
      font-size: 12px;
      color: var(--text-muted);
    }

    .session-meta {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .session-meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--text-secondary);
    }

    .session-meta-icon {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .session-branch {
      padding: 2px 8px;
      background: rgba(0, 122, 204, 0.1);
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      color: var(--primary);
      font-family: 'Consolas', 'Monaco', monospace;
    }

    .session-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--border);
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 48px 24px;
    }

    .empty-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 16px;
      background: var(--bg-tertiary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      color: var(--text-muted);
    }

    .empty-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    .empty-description {
      font-size: 14px;
      color: var(--text-secondary);
      margin-bottom: 24px;
    }

    /* Chart */
    .chart-container {
      margin-bottom: 24px;
    }

    .chart-header {
      margin-bottom: 16px;
    }

    .chart-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .chart-subtitle {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .comparison-bars {
      margin-bottom: 24px;
    }

    .comparison-item {
      margin-bottom: 16px;
    }

    .comparison-label {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13px;
    }

    .comparison-bar {
      height: 8px;
      background: var(--bg-primary);
      border-radius: 4px;
      overflow: hidden;
      position: relative;
    }

    .comparison-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.6s ease;
    }

    .comparison-fill.danger {
      background: linear-gradient(90deg, var(--danger), #E57373);
    }

    .comparison-fill.success {
      background: linear-gradient(90deg, var(--success), #66BB6A);
    }

    /* Insights */
    .insights-grid {
      display: grid;
      gap: 16px;
    }

    .insight-item {
      padding: 16px;
      background: var(--bg-primary);
      border-radius: 6px;
      border: 1px solid var(--border);
    }

    .insight-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .insight-row:not(:last-child) {
      border-bottom: 1px solid var(--border);
    }

    .insight-label {
      font-size: 13px;
      color: var(--text-secondary);
    }

    .insight-value {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .insight-value.success {
      color: var(--success);
    }

    .insight-value.primary {
      color: var(--primary);
    }

    /* ROI Card */
    .roi-card {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      padding: 24px;
      border-radius: 8px;
      color: white;
      margin-top: 24px;
    }

    .roi-label {
      font-size: 13px;
      opacity: 0.9;
      margin-bottom: 8px;
    }

    .roi-value {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .roi-description {
      font-size: 12px;
      opacity: 0.8;
    }

    /* Animations */
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .fade-in {
      animation: fadeIn 0.4s ease-out;
    }

    /* Loading Spinner */
    .spinner {
      border: 2px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      width: 16px;
      height: 16px;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Utilities */
    .text-muted {
      color: var(--text-muted);
    }

    .text-success {
      color: var(--success);
    }

    .text-danger {
      color: var(--danger);
    }

    .mb-24 {
      margin-bottom: 24px;
    }
  </style>
</head>
<body>
  <div class="dashboard">
    <!-- Header -->
    <header class="header fade-in">
      <div class="header-title">
        <h1>FlowLens Analytics</h1>
        <p class="header-subtitle">Session Management & Productivity Insights</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-ghost btn-sm" onclick="refreshDashboard()">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="opacity: 0.7">
            <path d="M13.65 2.35A7.95 7.95 0 0 0 8 0a8 8 0 1 0 7.35 4.93l-1.5-.66A6.5 6.5 0 1 1 8 1.5c1.3 0 2.5.38 3.5 1.03L9 5h5V0l-1.85 1.85z" fill="currentColor"/>
          </svg>
          Refresh
        </button>
        <button class="btn btn-primary btn-sm" onclick="captureSession()">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          New Session
        </button>
      </div>
    </header>

    <!-- Action Bar -->
    <div class="action-bar fade-in">
      <button class="btn btn-secondary btn-sm" onclick="restoreSession()">Restore Session</button>
      <button class="btn btn-secondary btn-sm" onclick="captureFromTemplate()">Use Template</button>
      <button class="btn btn-secondary btn-sm" onclick="showSessions()">View All</button>
      <button class="btn btn-secondary btn-sm" onclick="exportSessions()">Export</button>
      <button class="btn btn-secondary btn-sm" onclick="importSessions()">Import</button>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid fade-in">
      <div class="stat-card">
        <div class="stat-header">
          <div>
            <div class="stat-title">Total Sessions</div>
            <div class="stat-value">${fmt(totalSessions)}</div>
            <div class="stat-label">Captured workspaces</div>
          </div>
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="M9 9h6M9 15h6" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
        </div>
        ${sessionsThisWeek > 0 ? `<div class="stat-trend">+${sessionsThisWeek} this week</div>` : ''}
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <div>
            <div class="stat-title">Time Recovered</div>
            <div class="stat-value">${fmt(timeSavedHours)}h</div>
            <div class="stat-label">${fmt(timeSavedMinutes)} minutes saved</div>
          </div>
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
              <path d="M12 7v5l3 3" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
        </div>
        ${timeSavedMinutes > 0 ? `<div class="stat-trend">${fmt(weeklyTimeSaved)} min/week</div>` : ''}
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <div>
            <div class="stat-title">Value Generated</div>
            <div class="stat-value">$${fmt(costSaved, 2)}</div>
            <div class="stat-label">At $75/hour rate</div>
          </div>
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
        </div>
        ${costSaved > 0 ? `<div class="stat-trend">$${fmt(weeklyCostSaved, 2)}/week</div>` : ''}
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <div>
            <div class="stat-title">Productivity Gain</div>
            <div class="stat-value">${fmt(productivityGain)}%</div>
            <div class="stat-label">Context switch efficiency</div>
          </div>
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 12l5 5 13-13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
        </div>
        ${productivityGain > 0 ? `<div class="stat-trend">91% faster recovery</div>` : ''}
      </div>
    </div>

    <!-- Main Content -->
    <div class="content-grid fade-in">
      <!-- Recent Sessions -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Recent Sessions</h2>
          <span class="card-badge">${fmt(totalSessions)} total</span>
        </div>
        <div class="card-body">
          ${
            recentSessions.length === 0
              ? `
          <div class="empty-state">
            <div class="empty-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                <path d="M9 9h6M9 15h6" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <h3 class="empty-title">No Sessions Yet</h3>
            <p class="empty-description">Capture your first session to start tracking your productivity</p>
            <button class="btn btn-primary btn-sm" onclick="captureSession()">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Create Session
            </button>
          </div>
          `
              : recentSessions
                  .map((session) => {
                    const title = escapeHtml(session.title || "Untitled Session");
                    const date = formatDate(session.timestamp);
                    const timeAgo = getTimeAgo(session.timestamp);
                    const filesCount = session.editors?.length || 0;
                    const terminalsCount = session.terminals?.length || 0;
                    const branch = session.git?.branch
                      ? escapeHtml(session.git.branch)
                      : null;

                    return `
            <div class="session-item">
              <div class="session-header">
                <div class="session-title-wrapper">
                  <div class="session-title">${title}</div>
                  <div class="session-date">${timeAgo} • ${date}</div>
                </div>
              </div>
              <div class="session-meta">
                <div class="session-meta-item">
                  <span class="session-meta-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 3h12v10H2z" stroke="currentColor" stroke-width="1.5"/>
                      <path d="M5 6h6M5 9h4" stroke="currentColor" stroke-width="1.5"/>
                    </svg>
                  </span>
                  <span>${filesCount} ${filesCount === 1 ? 'file' : 'files'}</span>
                </div>
                <div class="session-meta-item">
                  <span class="session-meta-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" stroke-width="1.5"/>
                      <path d="M2 6h12" stroke="currentColor" stroke-width="1.5"/>
                    </svg>
                  </span>
                  <span>${terminalsCount} ${terminalsCount === 1 ? 'terminal' : 'terminals'}</span>
                </div>
                ${branch ? `<span class="session-branch">${branch}</span>` : ''}
              </div>
              <div class="session-actions">
                <button class="btn btn-success btn-sm" onclick="restoreSpecificSession('${escapeHtml(session.id)}')">
                  Restore
                </button>
                <button class="btn btn-ghost btn-sm" onclick="deleteSession('${escapeHtml(session.id)}')">
                  Delete
                </button>
              </div>
            </div>
          `;
                  })
                  .join("")
          }
        </div>
      </div>

      <!-- Analytics -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Productivity Analytics</h2>
          <span class="card-badge">Live Data</span>
        </div>
        <div class="card-body">
          <!-- Context Switch Comparison -->
          <div class="chart-container">
            <div class="chart-header">
              <div class="chart-title">Context Switch Recovery Time</div>
              <div class="chart-subtitle">Average time to regain focus</div>
            </div>
            <div class="comparison-bars">
              <div class="comparison-item">
                <div class="comparison-label">
                  <span class="text-muted">Without FlowLens</span>
                  <span class="text-danger" style="font-weight: 600;">23 min</span>
                </div>
                <div class="comparison-bar">
                  <div class="comparison-fill danger" style="width: 100%;"></div>
                </div>
              </div>
              <div class="comparison-item">
                <div class="comparison-label">
                  <span class="text-muted">With FlowLens</span>
                  <span class="text-success" style="font-weight: 600;">2 min</span>
                </div>
                <div class="comparison-bar">
                  <div class="comparison-fill success" style="width: 8.7%;"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Weekly Stats -->
          <div class="insights-grid">
            <div class="insight-item">
              <div class="insight-row">
                <span class="insight-label">Time Saved (Week)</span>
                <span class="insight-value success">${fmt(weeklyTimeSaved)} min</span>
              </div>
              <div class="insight-row">
                <span class="insight-label">Value Generated (Week)</span>
                <span class="insight-value success">$${fmt(weeklyCostSaved, 2)}</span>
              </div>
              <div class="insight-row">
                <span class="insight-label">Sessions (Week)</span>
                <span class="insight-value primary">${fmt(sessionsThisWeek)}</span>
              </div>
              <div class="insight-row">
                <span class="insight-label">Daily Average</span>
                <span class="insight-value primary">${fmt(avgSessionsPerDay, 1)}</span>
              </div>
            </div>
          </div>

          <!-- ROI Projection -->
          <div class="roi-card">
            <div class="roi-label">Projected Monthly Savings</div>
            <div class="roi-value">$${fmt(weeklyCostSaved * 4, 2)}</div>
            <div class="roi-description">
              Based on ${fmt(avgSessionsPerDay * 30)} interruptions/month at 21 min saved per session
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    (function() {
      const vscode = acquireVsCodeApi();

      function sendMessage(command, data = {}) {
        try {
          console.log('Sending:', command, data);
          vscode.postMessage({ command, ...data });
        } catch (error) {
          console.error('Message error:', error);
        }
      }

      window.captureSession = () => sendMessage('captureSession');
      window.restoreSession = () => sendMessage('restoreSession');
      window.showSessions = () => sendMessage('showSessions');
      window.captureFromTemplate = () => sendMessage('captureFromTemplate');
      window.exportSessions = () => sendMessage('exportSessions');
      window.importSessions = () => sendMessage('importSessions');
      window.refreshDashboard = () => sendMessage('refresh');

      window.deleteSession = (sessionId) => {
        if (!sessionId) return;
        if (confirm('Delete this session? This action cannot be undone.')) {
          sendMessage('deleteSession', { sessionId });
        }
      };

      window.restoreSpecificSession = (sessionId) => {
        if (!sessionId) return;
        sendMessage('restoreSpecificSession', { sessionId });
      };

      console.log('FlowLens Dashboard initialized');
    })();
  </script>
</body>
</html>`;
}

// Helper functions
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

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) {
    return "Just now";
  }
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)}w ago`;
  }
  return `${Math.floor(diffDays / 30)}mo ago`;
}
