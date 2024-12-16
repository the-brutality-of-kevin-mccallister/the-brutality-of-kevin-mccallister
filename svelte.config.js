import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			// Generate files in the `build` directory for GitHub Pages
			pages: 'build',
			assets: 'build',
			fallback: null
		}),
		paths: {
			base: '', // No base path, served at root
		},
		prerender: {
			entries: ['*'] // Prerender all pages
		}
	}
};

export default config;