import * as vscode from 'vscode';
import { GitSnapshot } from '../models/SessionSnapshot';

export class GitService {
	async captureGitInfo(): Promise<GitSnapshot | undefined> {
		try {
			const gitExt = vscode.extensions.getExtension('vscode.git')?.exports;
			if (gitExt && typeof gitExt.getAPI === 'function') {
				const api = gitExt.getAPI(1);
				const repo = api.repositories[0];
				if (repo) {
					return {
						branch: repo.state.HEAD?.name ?? null,
						head: repo.state.HEAD?.commit ?? null
					};
				}
			}
		} catch (e) {
			console.error('Failed to capture git info:', e);
		}
		return undefined;
	}
}
