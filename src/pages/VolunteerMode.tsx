import React, { useEffect } from 'react';
import { Package } from 'lucide-react';
import { deliveryApi } from '@/services/api';
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
  const [deliveries, setDeliveries] = React.useState<Array<{ id: string; food_name: string; status: string; address?: string }>>([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    deliveryApi.getVolunteerDeliveries()
      .then((res) => setDeliveries(Array.isArray(res.data?.data) ? res.data.data : res.data ? [res.data] : []))
      .catch(() => setDeliveries([]))
      .finally(() => setLoading(false));
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
          View and complete your assigned deliveries here.
        </p>

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
