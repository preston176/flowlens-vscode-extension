import * as assert from 'assert';
import * as vscode from 'vscode';
import { StorageService } from '../services/StorageService';
import { SessionSnapshot, WorkspaceInfo } from '../models/SessionSnapshot';

suite('StorageService Test Suite', () => {
	let storageService: StorageService;
	let mockContext: vscode.ExtensionContext;

	setup(function() {
		// Get the extension context - this requires the extension to be activated
		const ext = vscode.extensions.getExtension('preston176.flowlens-vscode-extension');
		if (!ext || !ext.isActive) {
			// Skip tests if extension is not active
			this.skip();
			return;
		}

		// Create a mock context for testing
		// Note: In a real test environment, you'd get this from the extension activation
		mockContext = {
			globalState: {
				get: (key: string, defaultValue?: any) => defaultValue,
				update: async (key: string, value: any) => {},
				setKeysForSync: (keys: readonly string[]) => {}
			}
		} as any;

		storageService = new StorageService(mockContext);
	});

	test('getSessions should return empty array initially', async () => {
		const sessions = await storageService.getSessions();
		assert.ok(Array.isArray(sessions), 'Should return an array');
	});

	test('saveSession should add session to storage', async function() {
		this.timeout(5000); // Increase timeout for async operations

		const session: SessionSnapshot = {
			id: 'test-session-1',
			title: 'Test Session',
			timestamp: new Date().toISOString(),
			editors: [
				{ path: '/test/file.txt', cursor: { line: 0, col: 0 } }
			],
			terminals: [],
			workspace: {
				name: 'test-workspace',
				path: '/path/to/workspace'
			}
		};

		// Mock the globalState to actually store values
		const storage = new Map<string, any>();
		mockContext.globalState.get = (key: string, defaultValue?: any) => {
			return storage.get(key) || defaultValue;
		};
		mockContext.globalState.update = async (key: string, value: any) => {
			storage.set(key, value);
		};

		const newStorageService = new StorageService(mockContext);

		await newStorageService.saveSession(session);
		const sessions = await newStorageService.getSessions();

		assert.ok(sessions.length > 0, 'Should have at least one session');
		assert.strictEqual(sessions[0].id, 'test-session-1', 'Session ID should match');
		assert.strictEqual(sessions[0].title, 'Test Session', 'Session title should match');
	});

	test('deleteSession should remove session from storage', async () => {
		const storage = new Map<string, any>();
		mockContext.globalState.get = (key: string, defaultValue?: any) => {
			return storage.get(key) || defaultValue;
		};
		mockContext.globalState.update = async (key: string, value: any) => {
			storage.set(key, value);
		};

		const newStorageService = new StorageService(mockContext);

		const session1: SessionSnapshot = {
			id: 'session-to-delete',
			title: 'Delete Me',
			timestamp: new Date().toISOString(),
			editors: [],
			terminals: []
		};

		const session2: SessionSnapshot = {
			id: 'session-to-keep',
			title: 'Keep Me',
			timestamp: new Date().toISOString(),
			editors: [],
			terminals: []
		};

		await newStorageService.saveSession(session1);
		await newStorageService.saveSession(session2);

		const beforeDelete = await newStorageService.getSessions();
		assert.strictEqual(beforeDelete.length, 2, 'Should have 2 sessions before delete');

		const result = await newStorageService.deleteSession('session-to-delete');
		assert.strictEqual(result.deleted, true, 'Should return deleted: true');
		assert.strictEqual(result.remaining, 1, 'Should have 1 remaining session');

		const afterDelete = await newStorageService.getSessions();
		assert.strictEqual(afterDelete.length, 1, 'Should have 1 session after delete');
		assert.strictEqual(afterDelete[0].id, 'session-to-keep', 'Remaining session should be the one we kept');
	});

	test('getSessionById should return correct session', async () => {
		const storage = new Map<string, any>();
		mockContext.globalState.get = (key: string, defaultValue?: any) => {
			return storage.get(key) || defaultValue;
		};
		mockContext.globalState.update = async (key: string, value: any) => {
			storage.set(key, value);
		};

		const newStorageService = new StorageService(mockContext);

		const session: SessionSnapshot = {
			id: 'unique-session-id',
			title: 'Find Me',
			timestamp: new Date().toISOString(),
			editors: [],
			terminals: []
		};

		await newStorageService.saveSession(session);

		const found = await newStorageService.getSessionById('unique-session-id');
		assert.ok(found, 'Should find the session');
		assert.strictEqual(found!.id, 'unique-session-id', 'Session ID should match');
		assert.strictEqual(found!.title, 'Find Me', 'Session title should match');

		const notFound = await newStorageService.getSessionById('non-existent-id');
		assert.strictEqual(notFound, undefined, 'Should return undefined for non-existent session');
	});

	test('getSessionsByWorkspace should filter by workspace', async () => {
		const storage = new Map<string, any>();
		mockContext.globalState.get = (key: string, defaultValue?: any) => {
			return storage.get(key) || defaultValue;
		};
		mockContext.globalState.update = async (key: string, value: any) => {
			storage.set(key, value);
		};

		const newStorageService = new StorageService(mockContext);

		const workspace1: WorkspaceInfo = {
			name: 'project-1',
			path: '/path/to/project-1'
		};

		const workspace2: WorkspaceInfo = {
			name: 'project-2',
			path: '/path/to/project-2'
		};

		const session1: SessionSnapshot = {
			id: 'session-1',
			title: 'Session 1',
			timestamp: new Date().toISOString(),
			editors: [],
			terminals: [],
			workspace: workspace1
		};

		const session2: SessionSnapshot = {
			id: 'session-2',
			title: 'Session 2',
			timestamp: new Date().toISOString(),
			editors: [],
			terminals: [],
			workspace: workspace2
		};

		const session3: SessionSnapshot = {
			id: 'session-3',
			title: 'Session 3',
			timestamp: new Date().toISOString(),
			editors: [],
			terminals: [],
			workspace: workspace1
		};

		await newStorageService.saveSession(session1);
		await newStorageService.saveSession(session2);
		await newStorageService.saveSession(session3);

		const workspace1Sessions = await newStorageService.getSessionsByWorkspace(workspace1);
		assert.strictEqual(workspace1Sessions.length, 2, 'Should have 2 sessions for workspace 1');

		const workspace2Sessions = await newStorageService.getSessionsByWorkspace(workspace2);
		assert.strictEqual(workspace2Sessions.length, 1, 'Should have 1 session for workspace 2');
	});

	test('saveSession should limit to 50 sessions', async () => {
		const storage = new Map<string, any>();
		mockContext.globalState.get = (key: string, defaultValue?: any) => {
			return storage.get(key) || defaultValue;
		};
		mockContext.globalState.update = async (key: string, value: any) => {
			storage.set(key, value);
		};

		const newStorageService = new StorageService(mockContext);

		// Create 60 sessions
		for (let i = 0; i < 60; i++) {
			const session: SessionSnapshot = {
				id: `session-${i}`,
				title: `Session ${i}`,
				timestamp: new Date().toISOString(),
				editors: [],
				terminals: []
			};
			await newStorageService.saveSession(session);
		}

		const allSessions = await newStorageService.getSessions();
		assert.strictEqual(allSessions.length, 50, 'Should limit to 50 sessions');

		// Most recent session should be first
		assert.strictEqual(allSessions[0].id, 'session-59', 'Most recent session should be first');
	});
});
