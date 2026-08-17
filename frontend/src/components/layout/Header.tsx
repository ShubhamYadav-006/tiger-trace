import React from 'react';
import { WifiOff, Cpu, AlertTriangle, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  activeAlertsCount?: number;
  isBackendConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeAlertsCount = 2,
  isBackendConnected = false,
}) => {
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

      <div className="flex items-center gap-4">
        {/* Offline Operation Indicator */}
        <div className="flex items-center gap-2 text-xs bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full text-slate-300">
          <WifiOff className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-medium">Offline Mode</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        {/* CPU Engine Status */}
        <div className="hidden md:flex items-center gap-2 text-xs bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-amber-400" />
          <span>Local CPU Runtime</span>
        </div>

        {/* Alerts Pill */}
        {activeAlertsCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-full text-red-400 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-bounce" />
            <span>{activeAlertsCount} Active Deviations</span>
          </div>
        )}

        {/* Backend Connection Indicator */}
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isBackendConnected ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          ></span>
          <span>{isBackendConnected ? 'Backend Connected' : 'Offline Storage Active'}</span>
        </div>
      </div>
    </header>
  );
};
