const esbuild = require("esbuild");

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: 'esbuild-problem-matcher',

	setup(build) {
		build.onStart(() => {
			console.log('[watch] build started');
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				console.error(`    ${location.file}:${location.line}:${location.column}:`);
			});
			console.log('[watch] build finished');
		});
	},
};

// Simple alias plugin to redirect react/react-dom to preact/compat for smaller bundles
const aliasPlugin = (aliases = {}) => ({
	name: 'alias-plugin',
	setup(build) {
		build.onResolve({ filter: /.*/ }, args => {
			if (aliases[args.path]) {
				return { path: aliases[args.path], external: false };
			}
			return null;
		});
	}
});

async function main() {
	const ctx = await esbuild.context({
		entryPoints: [
			'src/extension.ts'
		],
		bundle: true,
		format: 'cjs',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'node',
		outfile: 'dist/extension.js',
		external: ['vscode'],
		logLevel: 'silent',
		plugins: [
			/* add to the end of plugins array */
			esbuildProblemMatcherPlugin,
		],
	});

	// Bundle webview frontend (browser) only if source exists and required deps are installed
	const fs = require('fs');
	let webviewCtx;
	if (fs.existsSync('webview-src/index.tsx')) {
		let canBundle = true;
		try {
			require.resolve('preact');
		} catch (e) {
			canBundle = false;
			console.warn('Skipping webview bundle: please install preact to build the webview (or run npm install).');
		}

		if (canBundle) {
			try {
				// Use alias plugin so webview-src may import 'react' but we use preact/compat
				webviewCtx = await esbuild.context({
					entryPoints: ['webview-src/index.tsx'],
					bundle: true,
					format: 'iife',
					minify: production,
					sourcemap: !production,
					sourcesContent: false,
					platform: 'browser',
					outfile: 'dist/webview.js',
					logLevel: 'silent',
					plugins: [esbuildProblemMatcherPlugin, aliasPlugin({ 'react': 'preact/compat', 'react-dom': 'preact/compat' })],
				});

				// Try to build Tailwind CSS if postcss and tailwindcss are installed
				try {
					const fs = require('fs');
					if (fs.existsSync('webview-src/style.css')) {
						const postcss = require('postcss');
						const tailwind = require('tailwindcss');
						const autoprefixer = require('autoprefixer');
						const css = fs.readFileSync('webview-src/style.css', 'utf8');
						const result = await postcss([tailwind, autoprefixer]).process(css, { from: 'webview-src/style.css' });
						fs.mkdirSync('dist', { recursive: true });
						fs.writeFileSync('dist/webview.css', result.css, 'utf8');
						console.log('Built dist/webview.css (Tailwind)');
					}
				} catch (e) {
					console.warn('Tailwind build skipped — install postcss + tailwindcss to enable CSS bundling');
				}
			} catch (e) {
				console.warn('webview build failed:', e.message || e);
			}
		}
	}
	if (watch) {
		await ctx.watch();
		if (webviewCtx) { await webviewCtx.watch(); }
	} else {
		await ctx.rebuild();
		if (webviewCtx) { await webviewCtx.rebuild(); }
		await ctx.dispose();
		if (webviewCtx) { await webviewCtx.dispose(); }
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
