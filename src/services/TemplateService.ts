import * as vscode from "vscode";
import { SessionSnapshot } from "../models/SessionSnapshot";
import { StorageService } from "./StorageService";

export interface SessionTemplate {
  id: string;
  name: string;
  description: string;
  category: "frontend" | "backend" | "fullstack" | "debugging" | "custom";
  snapshot: Omit<SessionSnapshot, "id" | "timestamp">;
  tags: string[];
  isBuiltIn: boolean;
}

/**
 * TemplateService manages session templates and quick-start configurations
 */
export class TemplateService {
  private static readonly TEMPLATES_KEY = "flowlens.templates";

  constructor(private storageService: StorageService) {}

  /**
   * Get built-in session templates
   */
  getBuiltInTemplates(): SessionTemplate[] {
    return [
      {
        id: "react-component",
        name: "React Component Development",
        description: "Standard setup for developing React components",
        category: "frontend",
        tags: ["react", "frontend", "component"],
        isBuiltIn: true,
        snapshot: {
          title: "React Component Work",
          editors: [
            {
              path: "src/components/Component.tsx",
              cursor: { line: 1, col: 0 },
            },
            { path: "src/components/Component.test.tsx", cursor: null },
            { path: "src/styles/Component.css", cursor: null },
          ],
          terminals: [
            { name: "dev-server", lastCommand: "npm run dev" },
            { name: "test-watch", lastCommand: "npm run test:watch" },
          ],
          notes: "Component development session",
        },
      },
      {
        id: "api-debugging",
        name: "API Debugging Session",
        description: "Setup for debugging backend APIs",
        category: "debugging",
        tags: ["api", "backend", "debugging"],
        isBuiltIn: true,
        snapshot: {
          title: "API Debug Session",
          editors: [
            { path: "src/api/routes.ts", cursor: { line: 1, col: 0 } },
            { path: "src/api/controllers.ts", cursor: null },
            { path: "logs/error.log", cursor: null },
          ],
          terminals: [
            { name: "server", lastCommand: "npm run dev" },
            { name: "logs", lastCommand: "tail -f logs/error.log" },
            { name: "curl-tests", lastCommand: "" },
          ],
          notes: "Debugging API endpoints",
        },
      },
      {
        id: "fullstack-feature",
        name: "Full-Stack Feature",
        description: "Complete setup for full-stack feature development",
        category: "fullstack",
        tags: ["fullstack", "feature", "development"],
        isBuiltIn: true,
        snapshot: {
          title: "Full-Stack Feature",
          editors: [
            { path: "src/frontend/components/Feature.tsx", cursor: null },
            { path: "src/backend/api/feature.ts", cursor: null },
            { path: "src/backend/models/Feature.ts", cursor: null },
            { path: "README.md", cursor: null },
          ],
          terminals: [
            { name: "frontend", lastCommand: "npm run dev" },
            { name: "backend", lastCommand: "npm run server" },
            { name: "db", lastCommand: "docker-compose up" },
          ],
          notes: "Full-stack feature development",
        },
      },
      {
        id: "bug-fix",
        name: "Bug Fix Investigation",
        description: "Template for investigating and fixing bugs",
        category: "debugging",
        tags: ["bugfix", "debugging", "investigation"],
        isBuiltIn: true,
        snapshot: {
          title: "Bug Investigation",
          editors: [{ path: "REPRODUCE_BUG.md", cursor: { line: 1, col: 0 } }],
          terminals: [
            { name: "main", lastCommand: "" },
            { name: "test", lastCommand: "npm test" },
          ],
          notes: "Investigating reported bug",
        },
      },
    ];
  }

  /**
   * Get all templates (built-in + custom)
   */
  async getAllTemplates(): Promise<SessionTemplate[]> {
    const builtIn = this.getBuiltInTemplates();
    const custom = await this.getCustomTemplates();
    return [...builtIn, ...custom];
  }

  /**
   * Get custom user templates
   */
  async getCustomTemplates(): Promise<SessionTemplate[]> {
    const context = (this.storageService as any).context;
    const templates = context.globalState.get(
      TemplateService.TEMPLATES_KEY,
      []
    ) as SessionTemplate[];
    return templates;
  }

  /**
   * Save session as a template
   */
  async saveAsTemplate(
    session: SessionSnapshot,
    templateName: string,
    description: string,
    category: SessionTemplate["category"],
    tags: string[]
  ): Promise<void> {
    const template: SessionTemplate = {
      id: `custom_${Date.now()}`,
      name: templateName,
      description,
      category,
      tags,
      isBuiltIn: false,
      snapshot: {
        title: session.title,
        editors: session.editors,
        terminals: session.terminals,
        git: session.git,
        notes: session.notes,
        workspace: session.workspace,
      },
    };

    const customTemplates = await this.getCustomTemplates();
    customTemplates.push(template);

    const context = (this.storageService as any).context;
    await context.globalState.update(
      TemplateService.TEMPLATES_KEY,
      customTemplates
    );

    vscode.window.showInformationMessage(`Template "${templateName}" saved!`);
  }

  /**
   * Apply template to current workspace
   */
  async applyTemplate(template: SessionTemplate): Promise<SessionSnapshot> {
    const session: SessionSnapshot = {
      ...template.snapshot,
      id: `session_${new Date().toISOString()}`,
      timestamp: new Date().toISOString(),
    };

    return session;
  }

  /**
   * Delete custom template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    const customTemplates = await this.getCustomTemplates();
    const filtered = customTemplates.filter((t) => t.id !== templateId);

    const context = (this.storageService as any).context;
    await context.globalState.update(TemplateService.TEMPLATES_KEY, filtered);
  }
}
