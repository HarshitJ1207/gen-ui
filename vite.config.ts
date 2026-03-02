import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            // Frontend calls /ollama/api/chat, Vite proxies to local Ollama.
            '/ollama': {
                target: 'http://localhost:11434',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/ollama/, ''),
            },
        },
    },
});
