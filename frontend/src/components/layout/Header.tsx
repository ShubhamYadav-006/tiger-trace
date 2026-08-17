import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/20 overflow-hidden p-0.5">
          <img src="/logo.png" alt="TigerTrace Logo" className="w-full h-full object-contain rounded" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white font-heading leading-tight">
          TigerTrace
        </h1>
      </div>
    </header>
  );
};
