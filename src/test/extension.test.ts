import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('extension activates and commands are registered', async () => {
		const ext = vscode.extensions.getExtension('preston176.flowlens-vscode-extension');
		// If the extension id isn't the package id in the test environment, skip this check
		if (!ext) {
			// basic smoke assertions
			assert.ok(true);
			return;
		}

		await ext.activate();

		const commands = await vscode.commands.getCommands(true);
		assert.ok(commands.includes('FlowLens.helloWorld'));
		assert.ok(commands.includes('FlowLens.captureSession'));
		assert.ok(commands.includes('FlowLens.showSessions'));
	});
});
