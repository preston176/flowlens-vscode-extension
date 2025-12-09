import * as vscode from "vscode";
import { GitService } from "./GitService";
import { EditorSnapshot } from "../models/SessionSnapshot";

/**
 * SmartNamingService generates intelligent session names based on context
 */
export class SmartNamingService {
  constructor(private gitService: GitService) {}

  /**
   * Generate a smart session name based on git commits, open files, and time
   */
  async generateSessionName(editors: EditorSnapshot[]): Promise<string> {
    // Try git-based naming first
    const gitName = await this.getGitBasedName();
    if (gitName) {
      return gitName;
    }

    // Fall back to file-based naming
    const fileName = this.getFileBasedName(editors);
    if (fileName) {
      return fileName;
    }

    // Default time-based naming
    return this.getTimeBasedName();
  }

  /**
   * Get name from recent git commit
   */
  private async getGitBasedName(): Promise<string | null> {
    try {
      const gitInfo = await this.gitService.captureGitInfo();
      if (!gitInfo?.branch) {
        return null;
      }

      // Parse branch name for meaningful context
      const branch = gitInfo.branch;

      // Extract feature/fix name from branch
      const match = branch.match(
        /(?:feature|fix|bugfix|hotfix|feat)\/([\w-]+)/i
      );
      if (match) {
        return this.formatBranchName(match[1]);
      }

      // Use branch name if it's descriptive
      if (branch !== "main" && branch !== "master" && branch !== "develop") {
        return this.formatBranchName(branch);
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Get name from currently open files
   */
  private getFileBasedName(editors: EditorSnapshot[]): string | null {
    if (editors.length === 0) {
      return null;
    }

    // Find the most relevant file (prefer non-test, non-config files)
    const relevantFile =
      editors.find((e) => {
        const path = e.path.toLowerCase();
        return (
          !path.includes("test") &&
          !path.includes("config") &&
          !path.includes("package.json") &&
          !path.includes(".md")
        );
      }) || editors[0];

    // Extract meaningful name from file path
    const fileName = relevantFile.path.split("/").pop() || "";
    const nameWithoutExt = fileName.replace(/\.[^.]+$/, "");

    // Format: "Working on ComponentName"
    return `Working on ${this.capitalize(nameWithoutExt)}`;
  }

  /**
   * Get time-based name as fallback
   */
  private getTimeBasedName(): string {
    const now = new Date();
    const hour = now.getHours();

    let timeOfDay = "Morning";
    if (hour >= 12 && hour < 17) {
      timeOfDay = "Afternoon";
    } else if (hour >= 17) {
      timeOfDay = "Evening";
    }

    return `${timeOfDay} session`;
  }

  /**
   * Format branch name to be human-readable
   */
  private formatBranchName(name: string): string {
    return name
      .replace(/[-_]/g, " ")
      .split(" ")
      .map((word) => this.capitalize(word))
      .join(" ");
  }

  /**
   * Capitalize first letter of string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
