import React from 'react';
import { QrCode, Thermometer, Clock } from 'lucide-react';

export interface FoodPostCardData {
  id: number;
  food_name: string;
  food_type: string;
  quantity_servings: number;
  status: string;
  urgency_score: number;
  posted_at: string;
  min_storage_temp_celsius?: number | null;
  max_storage_temp_celsius?: number | null;
  availability_time_hours?: number | null;
}

export interface FoodPostCardProps {
  post: FoodPostCardData;
  darkMode: boolean;
  onShowQR?: (postId: number) => void;
}

export const FoodPostCard = React.memo(function FoodPostCard({
  post,
  darkMode,
  onShowQR,
}: FoodPostCardProps) {
  return (
    <li
      className={`flex items-center justify-between gap-4 p-3 rounded-lg ${
        darkMode ? 'bg-emerald-900/40' : 'bg-slate-50'
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className={`font-medium truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          {post.food_name}
        </p>
        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {post.food_type} · {post.quantity_servings} servings · {post.status} · Urgency{' '}
          {post.urgency_score}
        </p>
        {(post.min_storage_temp_celsius != null ||
          post.max_storage_temp_celsius != null ||
          (post.availability_time_hours != null && post.availability_time_hours > 0)) && (
          <p
            className={`text-xs mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0 ${
              darkMode ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            {(post.min_storage_temp_celsius != null || post.max_storage_temp_celsius != null) && (
              <span className="inline-flex items-center gap-0.5">
                <Thermometer className="w-3 h-3" />
                {post.min_storage_temp_celsius != null && post.max_storage_temp_celsius != null
                  ? `${post.min_storage_temp_celsius}–${post.max_storage_temp_celsius}°C`
                  : (post.min_storage_temp_celsius ?? post.max_storage_temp_celsius) + '°C'}
              </span>
            )}
            {post.availability_time_hours != null && post.availability_time_hours > 0 && (
              <span className="inline-flex items-center gap-0.5">
                <Clock className="w-3 h-3" />
                {post.availability_time_hours}h
              </span>
            )}
          </p>
        )}
        <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          {new Date(post.posted_at).toLocaleString()}
        </p>
      </div>
      {onShowQR && (
        <button
          type="button"
          onClick={() => onShowQR(post.id)}
          className={`shrink-0 p-2 rounded-lg ${
            darkMode
              ? 'bg-amber-600/30 text-amber-300 hover:bg-amber-600/50'
              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
          }`}
          title="Get QR code"
        >
          <QrCode className="w-5 h-5" />
        </button>
      )}
    </li>
  );
});
