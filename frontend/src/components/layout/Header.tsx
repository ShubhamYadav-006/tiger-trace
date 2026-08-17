import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <ShieldCheck className="w-5 h-5 text-slate-950 font-bold" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white font-heading leading-tight">
          TigerTrace
        </h1>
      </div>
    </header>
  );
};
