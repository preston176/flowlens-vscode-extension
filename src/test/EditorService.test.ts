import * as assert from 'assert';
import * as vscode from 'vscode';
import { EditorService } from '../services/EditorService';
import { SessionSnapshot } from '../models/SessionSnapshot';

suite('EditorService Test Suite', () => {
	let editorService: EditorService;

	setup(() => {
		editorService = new EditorService();
	});

	test('captureEditors should capture visible editors', () => {
		const editors = editorService.captureEditors();
		assert.ok(Array.isArray(editors), 'Should return an array of editors');

		// Each editor snapshot should have path and cursor properties
		editors.forEach(editor => {
			assert.ok('path' in editor, 'Editor should have path');
			assert.ok('cursor' in editor, 'Editor should have cursor');
		});
	});

	test('captureTerminals should capture all terminals', () => {
		const terminals = editorService.captureTerminals();
		assert.ok(Array.isArray(terminals), 'Should return an array of terminals');

		// Each terminal snapshot should have name property
		terminals.forEach(terminal => {
			assert.ok('name' in terminal, 'Terminal should have name');
		});
	});

	test('restoreTerminals should handle empty terminals array', () => {
		const session: SessionSnapshot = {
			id: 'test-1',
			title: 'Test Session',
			timestamp: new Date().toISOString(),
			editors: [],
			terminals: []
		};

		const restoredCount = editorService.restoreTerminals(session);
		assert.strictEqual(restoredCount, 0, 'Should return 0 for empty terminals');
	});

	test('restoreTerminals should create terminals from session', () => {
		const session: SessionSnapshot = {
			id: 'test-2',
			title: 'Test Session',
			timestamp: new Date().toISOString(),
			editors: [],
			terminals: [
				{ name: 'bash', lastCommand: null },
				{ name: 'npm', lastCommand: 'npm run dev' }
			]
		};

		const initialTerminalCount = vscode.window.terminals.length;
		const restoredCount = editorService.restoreTerminals(session);

		assert.strictEqual(restoredCount, 2, 'Should restore 2 terminals');
		assert.strictEqual(
			vscode.window.terminals.length,
			initialTerminalCount + 2,
			'Should have 2 more terminals after restoration'
		);
	});

	test('restoreEditors should handle non-existent files gracefully', async () => {
		const session: SessionSnapshot = {
			id: 'test-3',
			title: 'Test Session',
			timestamp: new Date().toISOString(),
			editors: [
				{
					path: '/non/existent/file.txt',
					cursor: { line: 0, col: 0 }
				}
			],
			terminals: []
		};

		const failedFiles = await editorService.restoreEditors(session);
		assert.strictEqual(failedFiles.length, 1, 'Should have 1 failed file');
		assert.strictEqual(failedFiles[0], '/non/existent/file.txt', 'Failed file should match');
	});

	test('restoreEditors should handle cursor bounds correctly', async function() {
		// This test requires a real file, so we'll skip if no workspace is open
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders || workspaceFolders.length === 0) {
			this.skip();
			return;
		}

		// Create a temporary file for testing
		const testFileUri = vscode.Uri.joinPath(workspaceFolders[0].uri, 'test-temp.txt');
		const testContent = 'Line 1\nLine 2\nLine 3';

		try {
			await vscode.workspace.fs.writeFile(testFileUri, Buffer.from(testContent, 'utf-8'));

			const session: SessionSnapshot = {
				id: 'test-4',
				title: 'Test Session',
				timestamp: new Date().toISOString(),
				editors: [
					{
						path: testFileUri.fsPath,
						cursor: { line: 1, col: 0 }
					}
				],
				terminals: []
			};

			const failedFiles = await editorService.restoreEditors(session);
			assert.strictEqual(failedFiles.length, 0, 'Should successfully restore file');

			// Verify cursor position
			const activeEditor = vscode.window.activeTextEditor;
			if (activeEditor) {
				assert.strictEqual(activeEditor.selection.active.line, 1, 'Cursor should be on line 1');
				assert.strictEqual(activeEditor.selection.active.character, 0, 'Cursor should be at column 0');
			}

			// Clean up
			await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
		} finally {
			// Delete test file
			try {
				await vscode.workspace.fs.delete(testFileUri);
			} catch (e) {
				// Ignore cleanup errors
			}
		}
	});

	teardown(async () => {
		// Close all editors and terminals after each test
		await vscode.commands.executeCommand('workbench.action.closeAllEditors');

		// Close all terminals
		vscode.window.terminals.forEach(terminal => terminal.dispose());
	});
});
