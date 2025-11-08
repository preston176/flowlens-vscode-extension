import * as assert from 'assert';
import * as vscode from 'vscode';
import { WorkspaceService } from '../services/WorkspaceService';
import { WorkspaceInfo } from '../models/SessionSnapshot';

suite('WorkspaceService Test Suite', () => {
	let workspaceService: WorkspaceService;

	setup(() => {
		workspaceService = new WorkspaceService();
	});

	test('getCurrentWorkspace should return undefined when no workspace is open', function() {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (workspaceFolders && workspaceFolders.length > 0) {
			// Skip test if workspace is open
			this.skip();
			return;
		}

		const workspace = workspaceService.getCurrentWorkspace();
		assert.strictEqual(workspace, undefined, 'Should return undefined when no workspace is open');
	});

	test('getCurrentWorkspace should return workspace info when workspace is open', function() {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders || workspaceFolders.length === 0) {
			// Skip test if no workspace is open
			this.skip();
			return;
		}

		const workspace = workspaceService.getCurrentWorkspace();
		assert.ok(workspace, 'Should return workspace info');
		assert.ok(workspace!.name, 'Workspace should have a name');
		assert.ok(workspace!.path, 'Workspace should have a path');
	});

	test('getWorkspaceName should extract workspace name from path', () => {
		const name = workspaceService.getWorkspaceName('/path/to/my-project');
		assert.strictEqual(name, 'my-project', 'Should extract correct workspace name');
	});

	test('getWorkspaceName should handle Windows paths', function() {
		// Skip on non-Windows platforms as path.basename behaves differently
		if (process.platform !== 'win32') {
			return this.skip();
		}

		const name = workspaceService.getWorkspaceName('C:\\Users\\test\\my-project');
		assert.strictEqual(name, 'my-project', 'Should handle Windows paths');
	});

	test('isSameWorkspace should return true for identical workspaces', () => {
		const workspace1: WorkspaceInfo = {
			name: 'test-project',
			path: '/path/to/test-project'
		};

		const workspace2: WorkspaceInfo = {
			name: 'test-project',
			path: '/path/to/test-project'
		};

		const isSame = workspaceService.isSameWorkspace(workspace1, workspace2);
		assert.strictEqual(isSame, true, 'Should return true for identical workspaces');
	});

	test('isSameWorkspace should return false for different workspaces', () => {
		const workspace1: WorkspaceInfo = {
			name: 'test-project-1',
			path: '/path/to/test-project-1'
		};

		const workspace2: WorkspaceInfo = {
			name: 'test-project-2',
			path: '/path/to/test-project-2'
		};

		const isSame = workspaceService.isSameWorkspace(workspace1, workspace2);
		assert.strictEqual(isSame, false, 'Should return false for different workspaces');
	});

	test('isSameWorkspace should normalize paths before comparison', () => {
		const workspace1: WorkspaceInfo = {
			name: 'test-project',
			path: '/path/to/../to/test-project'
		};

		const workspace2: WorkspaceInfo = {
			name: 'test-project',
			path: '/path/to/test-project'
		};

		const isSame = workspaceService.isSameWorkspace(workspace1, workspace2);
		assert.strictEqual(isSame, true, 'Should normalize paths before comparison');
	});

	test('isSameWorkspace should handle undefined workspaces', () => {
		const workspace: WorkspaceInfo = {
			name: 'test-project',
			path: '/path/to/test-project'
		};

		assert.strictEqual(
			workspaceService.isSameWorkspace(undefined, undefined),
			true,
			'Should return true when both are undefined'
		);

		assert.strictEqual(
			workspaceService.isSameWorkspace(workspace, undefined),
			false,
			'Should return false when one is undefined'
		);

		assert.strictEqual(
			workspaceService.isSameWorkspace(undefined, workspace),
			false,
			'Should return false when one is undefined'
		);
	});
});
