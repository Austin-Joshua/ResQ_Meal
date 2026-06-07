import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { foodApi } from '@/services/api';
import { FoodPostCard, type FoodPostCardData } from '@/components/FoodPostCard';

interface MyPostsListProps {
  darkMode: boolean;
  onShowQR?: (postId: number) => void;
}

const FOOD_TYPES = ['meals', 'vegetables', 'baked', 'dairy', 'fruits', 'others'];
const STATUSES = ['POSTED', 'MATCHED', 'ACCEPTED', 'PICKED_UP', 'DELIVERED', 'EXPIRED'];

export const MyPostsList: React.FC<MyPostsListProps> = ({ darkMode, onShowQR }) => {
  const [posts, setPosts] = useState<FoodPostCardData[]>([]);
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
      setPosts(Array.isArray(data) ? (data as FoodPostCardData[]) : []);
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
            <FoodPostCard key={p.id} post={p} darkMode={darkMode} onShowQR={onShowQR} />
          ))}
        </ul>
      )}
    </div>
  );
};
