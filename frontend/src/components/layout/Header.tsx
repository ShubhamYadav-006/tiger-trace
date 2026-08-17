import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center">
          <img src="/logo.png" alt="TigerTrace Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white font-heading leading-tight">
          TigerTrace
        </h1>
      </div>
    </header>
  );
};
