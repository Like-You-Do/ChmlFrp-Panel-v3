// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import AutoImport from 'unplugin-auto-import/vite';
import path from 'path';

export default defineConfig({
    root: process.cwd(), // 明确设置项目根目录
    base: '/', // 确保基础路径正确
    // 防止 Vite 清除 Rust 显示的错误
    clearScreen: false,
    server: {
        host: '0.0.0.0', // 允许外部访问
        port: 5173, // 明确端口
        strictPort: true, // 禁止端口自动切换
        open: false, // 自动打开浏览器
        watch: {
            // 告诉 Vite 忽略监听 `src-tauri` 目录
            ignored: ['**/src-tauri/**'],
        },
    },
    plugins: [
        vue(),
        Components({
            resolvers: [NaiveUiResolver()],
        }),
        AutoImport({
            imports: [
                'vue',
                {
                    'naive-ui': [
                        'useMessage',
                        'useLoadingBar',
                        'lightTheme',
                        'darkTheme',
                        'useDialog',
                        'useNotification',
                    ],
                },
            ],
            dts: 'src/auto-imports.d.ts',
            eslintrc: {
                enabled: true,
                filepath: './.eslintrc-auto-import.json',
                globalsPropValue: true,
            },
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'), // 添加这行
        },
    },
    // 添加有关当前构建目标的额外前缀，使这些 CLI 设置的 Tauri 环境变量可以在客户端代码中访问
    envPrefix: ['VITE_', 'TAURI_ENV_*'],
    build: {
        // Tauri 在 Windows 上使用 Chromium，在 macOS 和 Linux 上使用 WebKit
        target:
            process.env.TAURI_ENV_PLATFORM == 'windows'
                ? 'chrome105'
                : 'safari13',
        sourcemap: false, // 等效于 productionSourceMap: false
        minify: 'terser', // 默认使用 esbuild，显式声明使用 terser
        terserOptions: {
            format: {
                comments: false,
            },
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
        },
        chunkSizeWarningLimit: 800, // 单位 KB
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    if (id.includes('node_modules')) {
                        // 针对特定依赖进行分组
                        if (id.includes('naive-ui')) {
                            return 'vendor-naive-ui';
                        }
                        if (id.includes('echarts')) {
                            return 'vendor-echarts';
                        }
                        if (id.includes('three')) {
                            return 'vendor-three';
                        }
                        return 'vendors';
                    }
                    return 'shared';
                },
            },
        },
    },
});
