import * as vscode from "vscode";
import { SessionSnapshot } from "../models/SessionSnapshot";
import { StorageService } from "../services/StorageService";

export interface SessionMetrics {
  totalSessions: number;
  sessionsThisWeek: number;
  sessionsToday: number;
  avgSessionsPerDay: number;
  totalFilesRestored: number;
  totalTimeTracked: number; // milliseconds
  mostProductiveDay: string;
  contextSwitchesPerDay: number;
  estimatedTimeSaved: number; // minutes
  estimatedCostSaved: number; // dollars
}

export interface FlowMetrics {
  sessionId: string;
  sessionTitle: string;
  captureTime: string;
  restoreTime?: string;
  timeToFlow?: number; // milliseconds to get back into flow after restore
  filesOpened: number;
  terminalsRestored: number;
  interruptionType?: "meeting" | "break" | "context-switch" | "manual";
}

/**
 * AnalyticsService tracks usage metrics and calculates productivity insights
 */
export class AnalyticsService {
  private static readonly METRICS_KEY = "flowlens.metrics";
  private static readonly FLOW_METRICS_KEY = "flowlens.flowMetrics";

  // Assumptions for cost calculation
  private static readonly AVG_DEVELOPER_HOURLY_RATE = 75; // USD
  private static readonly AVG_CONTEXT_SWITCH_TIME = 23; // minutes (research-based)
  private static readonly FLOWLENS_RECOVERY_TIME = 2; // minutes

  constructor(private storageService: StorageService) {}

  /**
   * Calculate comprehensive session metrics
   */
  async getSessionMetrics(): Promise<SessionMetrics> {
    const sessions = await this.storageService.getSessions();
    const now = new Date();
    const startOfWeek = this.getStartOfWeek(now);
    const startOfToday = this.getStartOfDay(now);

    // Count sessions by time period
    const sessionsThisWeek = sessions.filter(
      (s) => new Date(s.timestamp) >= startOfWeek
    ).length;

    const sessionsToday = sessions.filter(
      (s) => new Date(s.timestamp) >= startOfToday
    ).length;

    // Calculate average sessions per day (last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentSessions = sessions.filter(
      (s) => new Date(s.timestamp) >= thirtyDaysAgo
    );
    const avgSessionsPerDay = recentSessions.length / 30;

    // Total files restored (tracked separately or estimated)
    const totalFilesRestored = sessions.reduce(
      (sum, s) => sum + s.editors.length,
      0
    );

    // Context switches per day
    const contextSwitchesPerDay = sessionsToday;

    // Time saved: (Normal context switch time - FlowLens recovery time) * number of sessions
    const timeSavedPerSwitch =
      AnalyticsService.AVG_CONTEXT_SWITCH_TIME -
      AnalyticsService.FLOWLENS_RECOVERY_TIME;
    const estimatedTimeSaved = Math.round(sessions.length * timeSavedPerSwitch);

    // Cost saved: (time saved in hours) * hourly rate
    const estimatedCostSaved = Math.round(
      (estimatedTimeSaved / 60) * AnalyticsService.AVG_DEVELOPER_HOURLY_RATE
    );

    // Most productive day (day with most sessions)
    const mostProductiveDay = this.getMostProductiveDay(sessions);

    return {
      totalSessions: sessions.length,
      sessionsThisWeek,
      sessionsToday,
      avgSessionsPerDay: Math.round(avgSessionsPerDay * 10) / 10,
      totalFilesRestored,
      totalTimeTracked: 0, // To be implemented with time tracking
      mostProductiveDay,
      contextSwitchesPerDay,
      estimatedTimeSaved,
      estimatedCostSaved,
    };
  }

  /**
   * Get productivity statistics for dashboard
   */
  async getProductivityStats() {
    const metrics = await this.getSessionMetrics();
    return {
      totalTimeSaved: metrics.estimatedTimeSaved,
      totalCostSaved: metrics.estimatedCostSaved,
      averageSessionsPerDay: metrics.avgSessionsPerDay,
      totalSessions: metrics.totalSessions,
      sessionsThisWeek: metrics.sessionsThisWeek,
      contextSwitchesPerDay: metrics.contextSwitchesPerDay,
    };
  }

  /**
   * Track flow metrics for a session
   */
  async trackFlowMetric(metric: FlowMetrics): Promise<void> {
    const context = (this.storageService as any).context;
    const metrics = context.globalState.get(
      AnalyticsService.FLOW_METRICS_KEY,
      []
    ) as FlowMetrics[];

    metrics.push(metric);

    // Keep only last 1000 metrics
    const trimmed = metrics.slice(-1000);
    await context.globalState.update(
      AnalyticsService.FLOW_METRICS_KEY,
      trimmed
    );
  }

  /**
   * Get flow metrics for analysis
   */
  async getFlowMetrics(): Promise<FlowMetrics[]> {
    const context = (this.storageService as any).context;
    return context.globalState.get(
      AnalyticsService.FLOW_METRICS_KEY,
      []
    ) as FlowMetrics[];
  }

  /**
   * Calculate time-to-flow average (how long it takes to get productive after restore)
   */
  async getAverageTimeToFlow(): Promise<number> {
    const metrics = await this.getFlowMetrics();
    const validMetrics = metrics.filter((m) => m.timeToFlow !== undefined);

    if (validMetrics.length === 0) {
      return 0;
    }

    const sum = validMetrics.reduce((acc, m) => acc + (m.timeToFlow || 0), 0);
    return Math.round(sum / validMetrics.length / 1000); // Convert to seconds
  }

  /**
   * Generate productivity report
   */
  async generateProductivityReport(): Promise<string> {
    const metrics = await this.getSessionMetrics();
    const avgTimeToFlow = await this.getAverageTimeToFlow();

    return `
# 📊 FlowLens Productivity Report

## Session Statistics
- **Total Sessions Captured**: ${metrics.totalSessions}
- **Sessions This Week**: ${metrics.sessionsThisWeek}
- **Sessions Today**: ${metrics.sessionsToday}
- **Average Sessions/Day**: ${metrics.avgSessionsPerDay}

## Impact Metrics
- **Context Switches**: ${metrics.contextSwitchesPerDay} today
- **Files Restored**: ${metrics.totalFilesRestored} total
- **Avg Time-to-Flow**: ${avgTimeToFlow}s after restore

## 💰 Time & Money Saved
- **Time Saved**: ${metrics.estimatedTimeSaved} minutes (~${Math.round(
      metrics.estimatedTimeSaved / 60
    )} hours)
- **Estimated Value**: $${metrics.estimatedCostSaved}
- **ROI**: ${metrics.estimatedTimeSaved} minutes saved / ${
      metrics.totalSessions
    } sessions = ${Math.round(
      metrics.estimatedTimeSaved / metrics.totalSessions
    )} min/session

## Insights
- **Most Productive Day**: ${metrics.mostProductiveDay}
- **Average Context Switch Recovery**: Without FlowLens: 23 min → With FlowLens: 2 min
- **Productivity Multiplier**: ${(
      AnalyticsService.AVG_CONTEXT_SWITCH_TIME /
      AnalyticsService.FLOWLENS_RECOVERY_TIME
    ).toFixed(1)}x faster recovery

---
*Based on research: Gloria Mark et al., "The Cost of Interrupted Work"*
		`.trim();
  }

  /**
   * Get start of current week
   */
  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    return new Date(d.setDate(diff));
  }

  /**
   * Get start of current day
   */
  private getStartOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * Find most productive day of the week
   */
  private getMostProductiveDay(sessions: SessionSnapshot[]): string {
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayCounts: { [key: number]: number } = {};

    sessions.forEach((s) => {
      const day = new Date(s.timestamp).getDay();
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });

    let maxDay = 0;
    let maxCount = 0;
    for (const [day, count] of Object.entries(dayCounts)) {
      if (count > maxCount) {
        maxCount = count;
        maxDay = parseInt(day);
      }
    }

    return dayNames[maxDay] || "N/A";
  }
}
