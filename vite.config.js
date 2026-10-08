import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { mobileBuildPlugin } from './scripts/mobileBuildPlugin.mjs';
import { mobileDiagnosticsPlugin } from './scripts/mobileDiagnosticsPlugin.mjs';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react(), mobileDiagnosticsPlugin(), mobileBuildPlugin()],
  // Keep Babylon prototype registrations and engine classes in one module graph.
  // Separate optimized deep imports can otherwise retain mismatched engine copies.
  resolve: { dedupe: ['@babylonjs/core', '@babylonjs/loaders'] },
  optimizeDeps: { exclude: ['@babylonjs/core', '@babylonjs/loaders'] },
  server: {
    port: 4177,
    strictPort: true,
    watch: {
      ignored: ['**/dist/**', '**/dist/**/*', '**/.temp*', '**/coverage/**'],
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)).replace(/\\/g, '/'),
        performance: fileURLToPath(new URL('./performance.html', import.meta.url)).replace(/\\/g, '/'),
        beachPreview: fileURLToPath(new URL('./beach-preview.html', import.meta.url)).replace(/\\/g, '/'),
        hudPreview: fileURLToPath(new URL('./hud-preview.html', import.meta.url)).replace(/\\/g, '/'),
        hudIconPreview: fileURLToPath(new URL('./hud-icon-preview.html', import.meta.url)).replace(/\\/g, '/'),
        avatarPreview: fileURLToPath(new URL('./avatar-preview.html', import.meta.url)).replace(/\\/g, '/'),
        artPreview: fileURLToPath(new URL('./art-preview.html', import.meta.url)).replace(/\\/g, '/'),
        fashionPreview: fileURLToPath(new URL('./fashion-preview.html', import.meta.url)).replace(/\\/g, '/'),
        venueTransitionTest: fileURLToPath(new URL('./venue-transition-test.html', import.meta.url)).replace(/\\/g, '/'),
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) return 'react-ui';
        },
      },
    },
  },
});
