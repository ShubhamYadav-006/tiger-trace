import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <ShieldCheck className="w-5 h-5 text-slate-950 font-bold" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white font-heading leading-tight">
              TigerTrace
            </h1>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 tracking-wider">
              Field Edition v1.0
            </span>
          </div>
          <p className="text-xs text-slate-400">Offline Camera Trap & Individual Tiger Intelligence</p>
        </div>
      </div>
    </header>
  );
};
