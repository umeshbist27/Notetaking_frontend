import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          
          react: ['react', 'react-dom'],
          
        
          query: ['@tanstack/react-query'],
          
         
          editor: ['@tinymce/tinymce-react'],
          
          
          toast: ['react-toastify'],
        },
      },
    },
    
  },
});
