import * as vscode from "vscode";

export type SubscriptionTier = "free" | "pro" | "team" | "enterprise";

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  expiresAt?: string;
  features: string[];
  limits: {
    maxSessions: number;
    maxSessionsPerDay: number;
    cloudSyncEnabled: boolean;
    teamSharingEnabled: boolean;
    analyticsEnabled: boolean;
    aiNamingEnabled: boolean;
    autoCaptureEnabled: boolean;
  };
}

export interface UsageStats {
  sessionsCreatedToday: number;
  totalSessions: number;
  lastResetDate: string;
}

/**
 * MonetizationService handles freemium logic, usage limits, and upgrade prompts
 */
export class MonetizationService {
  private static readonly SUBSCRIPTION_KEY = "flowlens.subscription";
  private static readonly USAGE_STATS_KEY = "flowlens.usageStats";

  constructor(private context: vscode.ExtensionContext) {}

  /**
   * Get current subscription info
   */
  getSubscription(): SubscriptionInfo {
    const stored = this.context.globalState.get<SubscriptionInfo>(
      MonetizationService.SUBSCRIPTION_KEY
    );

    if (stored) {
      return stored;
    }

    // Default free tier
    return this.getFreeTierInfo();
  }

  /**
   * Get free tier configuration
   */
  private getFreeTierInfo(): SubscriptionInfo {
    return {
      tier: "free",
      features: [
        "Unlimited local sessions",
        "Smart session naming",
        "Session templates",
        "Basic analytics",
        "Keyboard shortcuts",
      ],
      limits: {
        maxSessions: 50, // Keep last 50 sessions
        maxSessionsPerDay: 10,
        cloudSyncEnabled: false,
        teamSharingEnabled: false,
        analyticsEnabled: true,
        aiNamingEnabled: true,
        autoCaptureEnabled: false, // Premium feature
      },
    };
  }

  /**
   * Get Pro tier configuration
   */
  private getProTierInfo(): SubscriptionInfo {
    return {
      tier: "pro",
      features: [
        "Everything in Free",
        "Unlimited sessions",
        "Cloud sync (coming soon)",
        "Auto-capture triggers",
        "Advanced analytics",
        "Export to all formats",
        "Priority support",
      ],
      limits: {
        maxSessions: -1, // Unlimited
        maxSessionsPerDay: -1, // Unlimited
        cloudSyncEnabled: true,
        teamSharingEnabled: false,
        analyticsEnabled: true,
        aiNamingEnabled: true,
        autoCaptureEnabled: true,
      },
    };
  }

  /**
   * Get Team tier configuration
   */
  private getTeamTierInfo(): SubscriptionInfo {
    return {
      tier: "team",
      features: [
        "Everything in Pro",
        "Team session sharing",
        "Collaborative templates",
        "Team analytics dashboard",
        "SSO integration",
        "Admin controls",
      ],
      limits: {
        maxSessions: -1,
        maxSessionsPerDay: -1,
        cloudSyncEnabled: true,
        teamSharingEnabled: true,
        analyticsEnabled: true,
        aiNamingEnabled: true,
        autoCaptureEnabled: true,
      },
    };
  }

  /**
   * Check if user can create a new session
   */
  async canCreateSession(): Promise<{ allowed: boolean; reason?: string }> {
    const subscription = this.getSubscription();
    const usage = await this.getUsageStats();

    // Check daily limit
    if (subscription.limits.maxSessionsPerDay !== -1) {
      if (usage.sessionsCreatedToday >= subscription.limits.maxSessionsPerDay) {
        return {
          allowed: false,
          reason: `Daily limit reached (${subscription.limits.maxSessionsPerDay} sessions). Upgrade to Pro for unlimited captures.`,
        };
      }
    }

    // Check total sessions limit
    if (subscription.limits.maxSessions !== -1) {
      if (usage.totalSessions >= subscription.limits.maxSessions) {
        return {
          allowed: false,
          reason: `Storage limit reached (${subscription.limits.maxSessions} sessions). Upgrade to Pro for unlimited storage.`,
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Track session creation
   */
  async trackSessionCreation(): Promise<void> {
    const usage = await this.getUsageStats();
    usage.sessionsCreatedToday++;
    usage.totalSessions++;
    await this.context.globalState.update(
      MonetizationService.USAGE_STATS_KEY,
      usage
    );
  }

  /**
   * Get usage statistics
   */
  private async getUsageStats(): Promise<UsageStats> {
    const stored = this.context.globalState.get<UsageStats>(
      MonetizationService.USAGE_STATS_KEY
    );
    const today = new Date().toISOString().split("T")[0];

    if (!stored || stored.lastResetDate !== today) {
      // Reset daily counter
      const newStats: UsageStats = {
        sessionsCreatedToday: 0,
        totalSessions: stored?.totalSessions || 0,
        lastResetDate: today,
      };
      await this.context.globalState.update(
        MonetizationService.USAGE_STATS_KEY,
        newStats
      );
      return newStats;
    }

    return stored;
  }

  /**
   * Show upgrade prompt
   */
  async showUpgradePrompt(feature: string): Promise<void> {
    const action = await vscode.window.showInformationMessage(
      `🚀 ${feature} is a Pro feature`,
      "Upgrade to Pro",
      "Learn More",
      "Maybe Later"
    );

    if (action === "Upgrade to Pro") {
      await this.openPricingPage();
    } else if (action === "Learn More") {
      await vscode.env.openExternal(
        vscode.Uri.parse("https://flowlens-vscode.vercel.app#pricing")
      );
    }
  }

  /**
   * Open pricing page
   */
  private async openPricingPage(): Promise<void> {
    await vscode.env.openExternal(
      vscode.Uri.parse(
        "https://flowlens-vscode.vercel.app/pricing?utm_source=extension"
      )
    );
  }

  /**
   * Simulate pro upgrade (for testing)
   */
  async activateProTier(): Promise<void> {
    const proInfo = this.getProTierInfo();
    proInfo.expiresAt = new Date(
      Date.now() + 365 * 24 * 60 * 60 * 1000
    ).toISOString(); // 1 year
    await this.context.globalState.update(
      MonetizationService.SUBSCRIPTION_KEY,
      proInfo
    );
    vscode.window.showInformationMessage("🎉 Pro features activated!");
  }

  /**
   * Check if specific feature is available
   */
  hasFeature(feature: keyof SubscriptionInfo["limits"]): boolean {
    const subscription = this.getSubscription();
    return (
      subscription.limits[feature] === true ||
      subscription.limits[feature] === -1
    );
  }
}
