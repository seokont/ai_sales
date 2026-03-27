import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/widget.ts',
      name: 'AISellerWidget',
      fileName: 'widget',
      formats: ['iife'],
    },
    outDir: 'dist',
    emptyOutDir: true,
    minify: true,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        format: 'iife',
        extend: true,
      },
    },
  },
});
