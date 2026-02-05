import React, { useEffect, useState } from 'react';
import { Package, Utensils, MapPin } from 'lucide-react';
import { deliveryApi, organisationApi } from '@/services/api';
import { AppShell } from '@/components/AppShell';

const languageLabels = { en: 'English', ta: 'Tamil', hi: 'Hindi' };

interface VolunteerModeProps {
  darkMode: boolean;
  setDarkMode?: (v: boolean) => void;
  language?: 'en' | 'ta' | 'hi';
  setLanguage?: (v: 'en' | 'ta' | 'hi') => void;
  user: { name: string; email: string; role: string };
  onLogout: () => void;
}

const VolunteerMode: React.FC<VolunteerModeProps> = ({
  darkMode,
  setDarkMode,
  language = 'en',
  setLanguage,
  user,
  onLogout,
}) => {
  const [deliveries, setDeliveries] = useState<Array<{ id: string; food_name: string; status: string; address?: string }>>([]);
  const [availableFood, setAvailableFood] = useState<Array<{ id: number; food_name: string; food_type: string; quantity_servings: number; address?: string; organization_name?: string; status: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [availableFoodLoading, setAvailableFoodLoading] = useState(true);

  useEffect(() => {
    deliveryApi.getVolunteerDeliveries()
      .then((res) => setDeliveries(Array.isArray(res.data?.data) ? res.data.data : res.data ? [res.data] : []))
      .catch(() => setDeliveries([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    organisationApi.getAvailableFood()
      .then((res) => setAvailableFood(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => setAvailableFood([]))
      .finally(() => setAvailableFoodLoading(false));
  }, []);

  return (
    <AppShell
      title="Volunteer Mode"
      darkMode={darkMode}
      setDarkMode={setDarkMode ?? (() => {})}
      language={language}
      setLanguage={setLanguage ?? (() => {})}
      languageLabels={languageLabels}
      user={user}
      onLogout={onLogout}
      contentClassName="max-w-4xl"
    >
        <p className="mb-6 text-muted-foreground">
          View available food from organisations and your assigned deliveries here.
        </p>

        {/* Available food from organisations – reflected when org adds food */}
        <div className="studio-panel overflow-hidden mb-6">
          <div className="border-b border-border px-4 py-3">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Utensils className="w-4 h-4" />
              Available food from organisations
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Food added by organisations that needs pickup or delivery.
            </p>
          </div>
          <div className="p-4">
            {availableFoodLoading ? (
              <p className="text-muted-foreground">Loading…</p>
            ) : availableFood.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Utensils className="w-10 h-10 mb-2 opacity-60" />
                <p>No food from organisations right now.</p>
                <p className="text-sm mt-1">When organisations add food, it will appear here.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {availableFood.map((item) => (
                  <li
                    key={item.id}
                    className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition"
                  >
                    <p className="font-medium text-foreground">{item.food_name}</p>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      {item.organization_name && <span>{item.organization_name} · </span>}
                      {item.quantity_servings} servings · {(item.food_type || '').replace(/^./, (c) => c.toUpperCase())}
                    </p>
                    {item.address && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 shrink-0" /> {item.address}
                      </p>
                    )}
                    <span className="inline-block mt-2 text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                      {item.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="studio-panel overflow-hidden">
          <div className="border-b border-border px-4 py-3">
            <h2 className="font-semibold text-foreground">
              My deliveries
            </h2>
          </div>
          <div className="p-4">
            {loading ? (
              <p className="text-muted-foreground">Loading…</p>
            ) : deliveries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Package className="w-12 h-12 mb-3 opacity-60" />
                <p>No deliveries assigned yet.</p>
                <p className="text-sm mt-1">Your organisation will assign deliveries to you.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {deliveries.map((d) => (
                  <li
                    key={d.id}
                    className="p-3 rounded-lg border border-border bg-muted/50"
                  >
                    <p className="font-medium text-foreground">{d.food_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Status: {d.status} {d.address && ` · ${d.address}`}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
    </AppShell>
  );
};

export default VolunteerMode;
