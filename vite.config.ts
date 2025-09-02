import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // '@'를 'src' 폴더로 설정
    },
  },
  server: {
    https: true, // 개발 환경에서 HTTPS 사용 (쿠키 SameSite=None; Secure 문제 해결)
    port: 3000,
    host: true,
  },
});
