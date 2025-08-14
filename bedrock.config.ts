import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'lucky-dice',
  brand: {
    displayName: '럭키다이스', // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
    primaryColor: '#3182F6', // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: "https://static.toss.im/appsintoss/229/64f2d978-b47a-4aa3-a429-c7cd38945784.png", // 화면에 노출될 앱의 아이콘 이미지 주소로 바꿔주세요.
    bridgeColorMode: 'basic',
  },
  web: {
    host: '0.0.0.0',
    port: 5173,
    commands: {
      dev: 'vite dev --host 0.0.0.0',
      build: 'vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
});
