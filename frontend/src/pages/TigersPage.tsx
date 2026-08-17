import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowRight, MapPin, Compass } from 'lucide-react';
import { getTigers } from '../services/tigers';
import type { Tiger } from '../types/tiger';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const TigersPage: React.FC = () => {
  const navigate = useNavigate();
  const [tigers, setTigers] = useState<Tiger[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTigers() {
      try {
        const data = await getTigers();
        setTigers(data);
      } finally {
        setLoading(false);
      }
    }
    loadTigers();
  }, []);

  const filteredTigers = tigers.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || t.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-heading tracking-tight">
            Individual Tiger Catalogue
          </h1>
          <p className="text-xs text-slate-400">
            Persistent individual database of identified tigers in Pench Tiger Reserve.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Tiger ID or Name..."
              className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/60 w-60"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent focus:outline-none text-xs text-slate-200 cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Statuses</option>
              <option value="ACTIVE" className="bg-slate-900">Active</option>
              <option value="DISPLACED" className="bg-slate-900">Displaced</option>
              <option value="MISSING" className="bg-slate-900">Missing</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={4} height="h-64" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTigers.map((t) => (
            <div
              key={t.id}
              onClick={() => navigate(`/tigers/${t.id}`)}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all duration-300 shadow-xl cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Image Header */}
                <div className="relative h-48 bg-slate-950 overflow-hidden">
                  <img
                    src={t.primaryImage}
                    alt={t.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 shadow-md">
                      {t.id}
                    </span>
                    <StatusBadge
                      label={t.status}
                      variant={
                        t.status === 'ACTIVE'
                          ? 'success'
                          : t.status === 'DISPLACED'
                          ? 'warning'
                          : 'critical'
                      }
                      size="sm"
                    />
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <h3 className="text-base font-bold font-heading drop-shadow-md">
                      {t.name}
                    </h3>
                  </div>
                </div>

                {/* Tiger Details */}
                <div className="p-5 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                      <div className="text-slate-500 text-[10px] uppercase font-semibold">Gender & Age</div>
                      <div className="font-semibold text-slate-200 mt-0.5">{t.gender} • {t.estimatedAge}</div>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                      <div className="text-slate-500 text-[10px] uppercase font-semibold">Total Captures</div>
                      <div className="font-bold text-amber-400 font-mono mt-0.5">{t.totalCaptures} Frames</div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">Last Seen: <strong className="text-white">{t.lastStation}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Compass className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>Occupied Area: <strong className="text-amber-400 font-mono">{t.occupiedAreaSqKm} sq km</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="px-5 pb-5 pt-0">
                <button className="w-full py-2.5 bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-xs font-bold text-slate-200 rounded-xl transition-all flex items-center justify-center gap-2">
                  View Tiger Profile & Movement History
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
