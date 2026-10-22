import { defineConfig } from 'vite';
import preact from '@preact/preset-vite'; // React API, ~3 KB runtime instead of ~45 KB
export default defineConfig({ plugins: [preact()], build: { target: 'es2020', sourcemap: false } });
