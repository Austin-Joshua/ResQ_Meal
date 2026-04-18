import React, { useState, useEffect } from 'react';
import { Search, Filter, QrCode, ChevronDown, Thermometer, Clock } from 'lucide-react';
import { foodApi } from '@/services/api';

interface FoodPost {
  id: number;
  food_name: string;
  food_type: string;
  quantity_servings: number;
  status: string;
  urgency_score: number;
  posted_at: string;
  address?: string;
  min_storage_temp_celsius?: number | null;
  max_storage_temp_celsius?: number | null;
  availability_time_hours?: number | null;
}

interface MyPostsListProps {
  darkMode: boolean;
  onShowQR?: (postId: number) => void;
}

const FOOD_TYPES = ['meals', 'vegetables', 'baked', 'dairy', 'fruits', 'others'];
const STATUSES = ['POSTED', 'MATCHED', 'ACCEPTED', 'PICKED_UP', 'DELIVERED', 'EXPIRED'];

export const MyPostsList: React.FC<MyPostsListProps> = ({ darkMode, onShowQR }) => {
  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [foodType, setFoodType] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('posted_at');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await foodApi.getMyPosts();
      const data = res.data?.data ?? res.data ?? [];
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [foodType, status, sort]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  return (
    <div className={`rounded-xl p-6 ${darkMode ? 'bg-emerald-900/30 border border-emerald-600/25' : 'bg-white shadow'}`}>
      <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>My posts</h3>
      <form onSubmit={handleSearch} className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
          <input
            type="text"
            placeholder="Search by name or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 rounded-lg border text-sm ${
              darkMode ? 'bg-emerald-900/50 border-emerald-600/40 text-white' : 'bg-white border-slate-300 text-slate-900'
            }`}
          />
        </div>
        <select
          aria-label="Filter by food type"
          value={foodType}
          onChange={(e) => setFoodType(e.target.value)}
          className={`px-3 py-2 rounded-lg border text-sm ${
            darkMode ? 'bg-emerald-900/50 border-emerald-600/40 text-white' : 'bg-white border-slate-300 text-slate-900'
          }`}
        >
          <option value="">All types</option>
          {FOOD_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={`px-3 py-2 rounded-lg border text-sm ${
            darkMode ? 'bg-emerald-900/50 border-emerald-600/40 text-white' : 'bg-white border-slate-300 text-slate-900'
          }`}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          aria-label="Sort order"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className={`px-3 py-2 rounded-lg border text-sm ${
            darkMode ? 'bg-emerald-900/50 border-emerald-600/40 text-white' : 'bg-white border-slate-300 text-slate-900'
          }`}
        >
          <option value="posted_at">Newest first</option>
          <option value="urgency_score">Urgency (high first)</option>
          <option value="expiry_time">Expiry soon</option>
        </select>
        <button
          type="submit"
          className={`px-4 py-2 rounded-lg font-medium text-sm ${
            darkMode ? 'bg-amber-600 text-white hover:bg-amber-500' : 'bg-emerald-600 text-white hover:bg-emerald-500'
          }`}
        >
          Search
        </button>
      </form>
      {loading ? (
        <p className={`text-sm py-6 text-center ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Loading...</p>
      ) : posts.length === 0 ? (
        <p className={`text-sm py-6 text-center ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>No posts found.</p>
      ) : (
        <ul className="space-y-2">
          {posts.map((p) => (
            <li
              key={p.id}
              className={`flex items-center justify-between gap-4 p-3 rounded-lg ${
                darkMode ? 'bg-emerald-900/40' : 'bg-slate-50'
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className={`font-medium truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>{p.food_name}</p>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {p.food_type} · {p.quantity_servings} servings · {p.status} · Urgency {p.urgency_score}
                </p>
                {(p.min_storage_temp_celsius != null || p.max_storage_temp_celsius != null || (p.availability_time_hours != null && p.availability_time_hours > 0)) && (
                  <p className={`text-xs mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {(p.min_storage_temp_celsius != null || p.max_storage_temp_celsius != null) && (
                      <span className="inline-flex items-center gap-0.5">
                        <Thermometer className="w-3 h-3" />
                        {p.min_storage_temp_celsius != null && p.max_storage_temp_celsius != null
                          ? `${p.min_storage_temp_celsius}–${p.max_storage_temp_celsius}°C`
                          : (p.min_storage_temp_celsius ?? p.max_storage_temp_celsius) + '°C'}
                      </span>
                    )}
                    {p.availability_time_hours != null && p.availability_time_hours > 0 && (
                      <span className="inline-flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {p.availability_time_hours}h
                      </span>
                    )}
                  </p>
                )}
                <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  {new Date(p.posted_at).toLocaleString()}
                </p>
              </div>
              {onShowQR && (
                <button
                  type="button"
                  onClick={() => onShowQR(p.id)}
                  className={`shrink-0 p-2 rounded-lg ${darkMode ? 'bg-amber-600/30 text-amber-300 hover:bg-amber-600/50' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
                  title="Get QR code"
                >
                  <QrCode className="w-5 h-5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
