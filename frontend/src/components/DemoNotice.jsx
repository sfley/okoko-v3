import React from 'react';
import { RotateCcw } from 'lucide-react';
export default function DemoNotice() {
  return <aside className="demo-notice" aria-label="Mode démonstration">
    <div><strong>Démonstration interactive</strong><span>Données fictives · Aucune chaudière connectée · Modifications dans ce navigateur uniquement</span></div>
    <button className="button small" onClick={async()=>{const {resetDemo}=await import('../../demo/api.js');resetDemo();}}><RotateCcw size={14}/>Réinitialiser la démo</button>
  </aside>;
}
