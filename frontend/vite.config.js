import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
export default defineConfig(({mode})=>{
  const demo=mode==='demo';
  const output=demo?'../demo-dist':'../backend/internal/web/dist';
  return {
    base:demo?'./':'/',
    define:{'import.meta.env.VITE_OKOKO_DEMO':JSON.stringify(demo)},
    plugins:[react(),{name:'precompress',closeBundle(){
      const dir=new URL(`${output}/assets/`,import.meta.url);
      for(const name of readdirSync(dir)) if(/\.(js|css)$/.test(name)) writeFileSync(new URL(name+'.gz',dir),gzipSync(readFileSync(new URL(name,dir)),{level:9}));
    }}],
    build:{outDir:output,emptyOutDir:true,rollupOptions:{output:{manualChunks:{charts:['recharts'],grid:['react-grid-layout']}}}},
    server:{proxy:demo?undefined:{'/api':'http://127.0.0.1:8888','/health':'http://127.0.0.1:8888'}},
  };
});
