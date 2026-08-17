import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="h-24 border-b border-stone-300 bg-white px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-4">
        <div className="w-28 h-28 flex items-center justify-center -ml-3">
          <img src="/logo.png" alt="TigerTrace Logo" className="w-full h-full object-contain scale-150" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 font-heading leading-tight">
          TigerTrace
        </h1>
      </div>
    </header>
  );
};
