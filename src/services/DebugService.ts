import * as vscode from "vscode";

export interface BreakpointSnapshot {
  filePath: string;
  line: number;
  condition?: string;
  hitCondition?: string;
  logMessage?: string;
  enabled: boolean;
}

export interface DebugConfigSnapshot {
  type: string;
  name: string;
  request: string;
  [key: string]: any;
}

export interface DebugSnapshot {
  breakpoints: BreakpointSnapshot[];
  activeConfiguration?: DebugConfigSnapshot;
  watchExpressions?: string[];
}

/**
 * DebugService captures and restores debug state
 */
export class DebugService {
  /**
   * Capture current debug state
   */
  captureDebugState(): DebugSnapshot {
    const breakpoints = this.captureBreakpoints();
    const watchExpressions = this.captureWatchExpressions();

    return {
      breakpoints,
      watchExpressions,
    };
  }

  /**
   * Capture all breakpoints
   */
  private captureBreakpoints(): BreakpointSnapshot[] {
    const allBreakpoints = vscode.debug.breakpoints;
    const snapshots: BreakpointSnapshot[] = [];

    for (const bp of allBreakpoints) {
      if (bp instanceof vscode.SourceBreakpoint) {
        snapshots.push({
          filePath: bp.location.uri.fsPath,
          line: bp.location.range.start.line,
          condition: bp.condition,
          hitCondition: bp.hitCondition,
          logMessage: bp.logMessage,
          enabled: bp.enabled,
        });
      }
    }

    return snapshots;
  }

  /**
   * Capture watch expressions (if accessible)
   */
  private captureWatchExpressions(): string[] {
    // Note: VS Code API doesn't directly expose watch expressions
    // This would require accessing the debug view's watch section
    // For now, return empty array
    return [];
  }

  /**
   * Restore breakpoints
   */
  async restoreBreakpoints(breakpoints: BreakpointSnapshot[]): Promise<void> {
    // Clear existing breakpoints (optional)
    // vscode.debug.removeBreakpoints(vscode.debug.breakpoints);

    const sourceBreakpoints: vscode.Breakpoint[] = [];

    for (const bp of breakpoints) {
      try {
        const uri = vscode.Uri.file(bp.filePath);
        const location = new vscode.Location(
          uri,
          new vscode.Position(bp.line, 0)
        );

        const sourceBp = new vscode.SourceBreakpoint(
          location,
          bp.enabled,
          bp.condition,
          bp.hitCondition,
          bp.logMessage
        );

        sourceBreakpoints.push(sourceBp);
      } catch (error) {
        console.error(
          `Failed to restore breakpoint at ${bp.filePath}:${bp.line}`,
          error
        );
      }
    }

    if (sourceBreakpoints.length > 0) {
      vscode.debug.addBreakpoints(sourceBreakpoints);
    }
  }

  /**
   * Get active debug configuration
   */
  getActiveDebugConfiguration(): DebugConfigSnapshot | undefined {
    const activeSession = vscode.debug.activeDebugSession;
    if (!activeSession) {
      return undefined;
    }

    return {
      type: activeSession.type,
      name: activeSession.name,
      request: "launch", // This is a simplification
    };
  }
}
