import * as vscode from "vscode";

export interface ExtensionSettingsSnapshot {
  extensionId: string;
  settings: { [key: string]: any };
}

export interface WorkspaceSettingsSnapshot {
  globalSettings: { [key: string]: any };
  workspaceSettings: { [key: string]: any };
  extensionSettings: ExtensionSettingsSnapshot[];
}

/**
 * SettingsService captures and restores VS Code settings per session
 */
export class SettingsService {
  private static readonly KEY_EXTENSIONS = [
    "prettier",
    "eslint",
    "typescript",
    "python",
    "go",
    "rust-analyzer",
    "vscode-icons",
    "gitlens",
  ];

  /**
   * Capture current workspace settings
   */
  captureSettings(): WorkspaceSettingsSnapshot {
    const config = vscode.workspace.getConfiguration();

    return {
      globalSettings: this.captureKeySettings(config),
      workspaceSettings: this.captureWorkspaceSpecificSettings(),
      extensionSettings: this.captureExtensionSettings(),
    };
  }

  /**
   * Capture important global settings
   */
  private captureKeySettings(config: vscode.WorkspaceConfiguration): {
    [key: string]: any;
  } {
    const keySettings = [
      "editor.fontSize",
      "editor.tabSize",
      "editor.formatOnSave",
      "editor.wordWrap",
      "files.autoSave",
      "terminal.integrated.fontSize",
      "workbench.colorTheme",
    ];

    const settings: { [key: string]: any } = {};
    for (const setting of keySettings) {
      const value = config.get(setting);
      if (value !== undefined) {
        settings[setting] = value;
      }
    }

    return settings;
  }

  /**
   * Capture workspace-specific settings
   */
  private captureWorkspaceSpecificSettings(): { [key: string]: any } {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return {};
    }

    const config = vscode.workspace.getConfiguration("", workspaceFolder.uri);
    const settings: { [key: string]: any } = {};

    // Add workspace-specific settings here
    const workspaceKeys = [
      "files.exclude",
      "search.exclude",
      "files.watcherExclude",
    ];

    for (const key of workspaceKeys) {
      const value = config.get(key);
      if (value !== undefined) {
        settings[key] = value;
      }
    }

    return settings;
  }

  /**
   * Capture settings for key extensions
   */
  private captureExtensionSettings(): ExtensionSettingsSnapshot[] {
    const snapshots: ExtensionSettingsSnapshot[] = [];

    for (const extId of SettingsService.KEY_EXTENSIONS) {
      const config = vscode.workspace.getConfiguration(extId);
      const settings: { [key: string]: any } = {};

      // Get all settings for this extension
      const inspect = config.inspect("");
      if (inspect) {
        // Capture workspace settings for this extension
        Object.keys(config).forEach((key) => {
          const value = config.get(key);
          if (value !== undefined && typeof value !== "function") {
            settings[key] = value;
          }
        });
      }

      if (Object.keys(settings).length > 0) {
        snapshots.push({
          extensionId: extId,
          settings,
        });
      }
    }

    return snapshots;
  }

  /**
   * Restore settings (with user confirmation)
   */
  async restoreSettings(
    snapshot: WorkspaceSettingsSnapshot,
    silent: boolean = false
  ): Promise<void> {
    if (!silent) {
      const confirm = await vscode.window.showWarningMessage(
        "Restore session settings? This will modify your current workspace configuration.",
        "Yes",
        "No"
      );

      if (confirm !== "Yes") {
        return;
      }
    }

    // Restore global settings
    const config = vscode.workspace.getConfiguration();
    for (const [key, value] of Object.entries(snapshot.globalSettings)) {
      try {
        await config.update(key, value, vscode.ConfigurationTarget.Workspace);
      } catch (error) {
        console.error(`Failed to restore setting ${key}:`, error);
      }
    }

    vscode.window.showInformationMessage("✅ Settings restored");
  }
}
