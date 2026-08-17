import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowRight, MapPin, Compass, Calendar, Camera } from 'lucide-react';
import { getTigers } from '../services/tigers';
import type { Tiger } from '../types/tiger';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';

export const TigersPage: React.FC = () => {
  const navigate = useNavigate();
  const [tigers, setTigers] = useState<Tiger[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedGender, setSelectedGender] = useState<string>('ALL');
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
    const matchesGender = selectedGender === 'ALL' || t.gender === selectedGender;
    return matchesSearch && matchesStatus && matchesGender;
  });

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 font-heading tracking-tight">
            Individual Tiger Catalogue
          </h1>
          <p className="text-xs text-stone-600">
            Persistent database of verified individual tigers in Pench Tiger Reserve.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Tiger ID or Name..."
              className="bg-white border border-stone-300 rounded-lg pl-9 pr-4 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-600 w-60 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800 shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent focus:outline-none text-xs text-stone-800 cursor-pointer"
            >
              <option value="ALL" className="bg-white">All Statuses</option>
              <option value="ACTIVE" className="bg-white">Active</option>
              <option value="DISPLACED" className="bg-white">Displaced</option>
              <option value="MISSING" className="bg-white">Missing</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800 shadow-2xs">
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="bg-transparent focus:outline-none text-xs text-stone-800 cursor-pointer"
            >
              <option value="ALL" className="bg-white">All Genders</option>
              <option value="MALE" className="bg-white">Male</option>
              <option value="FEMALE" className="bg-white">Female</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton type="card" count={6} />
      ) : filteredTigers.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No Tiger Records Found"
          description="No individual tigers match your search or filter criteria."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedStatus('ALL');
            setSelectedGender('ALL');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTigers.map((t) => (
            <div
              key={t.id}
              onClick={() => navigate(`/tigers/${t.id}`)}
              className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-emerald-500 transition-all duration-300 shadow-xs cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Image Header */}
                <div className="relative h-48 bg-stone-100 overflow-hidden">
                  <img
                    src={t.primaryImage}
                    alt={t.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/10 to-transparent"></div>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-emerald-600 text-white shadow-xs">
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

                {/* Tiger Details Grid */}
                <div className="p-5 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                      <div className="text-stone-500 text-[10px] uppercase font-bold">Gender & Age</div>
                      <div className="font-semibold text-stone-900 mt-0.5">{t.gender} • {t.estimatedAge}</div>
                    </div>
                    <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                      <div className="text-stone-500 text-[10px] uppercase font-bold flex items-center gap-1">
                        <Camera className="w-3 h-3 text-emerald-700" /> Captures
                      </div>
                      <div className="font-bold text-emerald-700 font-mono mt-0.5">{t.totalCaptures} Frames</div>
                    </div>
                  </div>

                  {/* First Seen & Last Seen Dates */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                      <div className="text-stone-500 text-[10px] uppercase font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-blue-600" /> First Seen
                      </div>
                      <div className="font-mono text-stone-800 text-[11px] mt-0.5">{formatDate(t.firstSeen)}</div>
                    </div>
                    <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                      <div className="text-stone-500 text-[10px] uppercase font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-emerald-600" /> Last Seen
                      </div>
                      <div className="font-mono text-stone-800 text-[11px] mt-0.5">{formatDate(t.lastSeen)}</div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-stone-700">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">Last Station: <strong className="text-stone-900">{t.lastStation}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Compass className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>Occupied Area: <strong className="text-emerald-700 font-mono">{t.occupiedAreaSqKm} sq km</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="px-5 pb-5 pt-0">
                <button className="w-full py-2.5 bg-stone-100 group-hover:bg-emerald-600 group-hover:text-white text-xs font-bold text-stone-800 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-stone-200 shadow-2xs">
                  View Profile & Movement Trajectory
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
