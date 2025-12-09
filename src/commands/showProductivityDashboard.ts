import * as vscode from "vscode";
import { StorageService } from "../services/StorageService";
import { AnalyticsService } from "../services/AnalyticsService";

/**
 * Show productivity dashboard with analytics
 */
export async function showProductivityDashboardCommand(
  storageService: StorageService
): Promise<void> {
  const analytics = new AnalyticsService(storageService);

  // Generate report
  const report = await analytics.generateProductivityReport();

  // Show in a new document
  const doc = await vscode.workspace.openTextDocument({
    content: report,
    language: "markdown",
  });

  await vscode.window.showTextDocument(doc, { preview: false });

  // Offer actions
  const action = await vscode.window.showInformationMessage(
    "📊 Productivity report generated!",
    "Export as PDF",
    "Share Metrics"
  );

  if (action === "Share Metrics") {
    const metrics = await analytics.getSessionMetrics();
    const summary =
      `💪 My coding productivity with FlowLens:\n` +
      `• ${metrics.totalSessions} sessions captured\n` +
      `• ${metrics.estimatedTimeSaved} minutes saved\n` +
      `• $${metrics.estimatedCostSaved} value created\n` +
      `• ${Math.round(metrics.avgSessionsPerDay)} avg sessions/day\n\n` +
      `Get FlowLens: https://marketplace.visualstudio.com/items?itemName=preston176.flowlens`;

    await vscode.env.clipboard.writeText(summary);
    vscode.window.showInformationMessage("✅ Metrics copied to clipboard!");
  }
}
