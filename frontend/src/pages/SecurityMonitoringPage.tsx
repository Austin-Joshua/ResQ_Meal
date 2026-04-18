import React, { useEffect, useState } from 'react';
import { AppShell, AppShellNavItem } from '@/components/AppShell';
import { Shield, List, AlertOctagon, Ban, RefreshCw, Loader2, Radar } from 'lucide-react';
import {
  adminSecurityApi,
  userApi,
  type BlockedEntityRow,
  type SecurityLogRow,
  type ThreatMlEventRow,
} from '@/services/api';

interface SecurityMonitoringPageProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  language: 'en' | 'ta' | 'hi';
  setLanguage: (lang: 'en' | 'ta' | 'hi') => void;
  user: { id: number; name: string; email: string; role: string };
  onLogout: () => void;
  onBack: () => void;
}

const SecurityMonitoringPage: React.FC<SecurityMonitoringPageProps> = ({
  darkMode,
  setDarkMode,
  language,
  setLanguage,
  user,
  onLogout,
  onBack,
}) => {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [active, setActive] = useState<'logs' | 'critical' | 'blocked' | 'ml'>('logs');
  const [logs, setLogs] = useState<SecurityLogRow[]>([]);
  const [criticalLogs, setCriticalLogs] = useState<SecurityLogRow[]>([]);
  const [blocked, setBlocked] = useState<BlockedEntityRow[]>([]);
  const [threatMl, setThreatMl] = useState<ThreatMlEventRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navItems: AppShellNavItem[] = [
    { id: 'logs', icon: List, label: 'All logs' },
    { id: 'critical', icon: AlertOctagon, label: 'Critical' },
    { id: 'blocked', icon: Ban, label: 'Blocked' },
    { id: 'ml', icon: Radar, label: 'ML threats' },
  ];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await userApi.getMe();
        const envelope = res.data as { data?: { is_security_admin?: boolean } };
        if (!cancelled) {
          setAllowed(!!envelope?.data?.is_security_admin);
        }
      } catch {
        if (!cancelled) setAllowed(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [l, c, b, m] = await Promise.all([
        adminSecurityApi.getLogs(150),
        adminSecurityApi.getCriticalLogs(150),
        adminSecurityApi.getBlocked(),
        adminSecurityApi.getThreatMlEvents(150),
      ]);
      setLogs(l.data.data ?? []);
      setCriticalLogs(c.data.data ?? []);
      setBlocked(b.data.data ?? []);
      setThreatMl(m.data.data ?? []);
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'response' in e
        ? String((e as { response?: { status?: number } }).response?.status)
        : 'Failed to load';
      setError(msg === '403' ? 'Access denied' : 'Could not load security data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (allowed) void load();
  }, [allowed]);

  const tableShell =
    darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200';

  const renderRows = (rows: SecurityLogRow[]) => (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className={darkMode ? 'bg-slate-900/80' : 'bg-slate-100'}>
          <tr>
            <th className="text-left p-2 font-semibold">Time</th>
            <th className="text-left p-2 font-semibold">User</th>
            <th className="text-left p-2 font-semibold">IP</th>
            <th className="text-left p-2 font-semibold">Action</th>
            <th className="text-left p-2 font-semibold">Status</th>
            <th className="text-left p-2 font-semibold">Critical</th>
            <th className="text-left p-2 font-semibold">Details</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.id}
              className={`border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}
            >
              <td className="p-2 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
              <td className="p-2">{r.user_id ?? '—'}</td>
              <td className="p-2 font-mono text-xs">{r.ip_address}</td>
              <td className="p-2">{r.action}</td>
              <td className="p-2">{r.status}</td>
              <td className="p-2">{r.is_critical ? 'Yes' : 'No'}</td>
              <td className="p-2 max-w-xs truncate" title={r.details ?? ''}>
                {r.details ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (allowed === null) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50'}`}>
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-4 px-4 ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50'}`}>
        <Shield className="w-12 h-12 text-amber-500" />
        <p className="text-center">You do not have access to security monitoring. Set ADMIN_USER_IDS on the server for your user id.</p>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <AppShell
      title="ResQ Meal"
      subtitle="Security monitoring"
      sidebarItems={navItems}
      activeId={active}
      onNavigate={(id) => setActive(id as typeof active)}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      language={language}
      setLanguage={setLanguage}
      languageLabels={{ en: 'English', ta: 'Tamil', hi: 'Hindi' }}
      user={user}
      onLogout={onLogout}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-600" />
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Security monitoring
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onBack}
              className={`px-3 py-2 rounded-lg text-sm font-semibold border ${darkMode ? 'border-slate-600 text-slate-200' : 'border-slate-300 text-slate-800'}`}
            >
              Back to app
            </button>
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 text-red-900 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {active === 'logs' && (
          <section className={`rounded-xl border p-4 ${tableShell}`}>
            <h2 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Audit log</h2>
            {renderRows(logs)}
          </section>
        )}

        {active === 'critical' && (
          <section className={`rounded-xl border p-4 ${tableShell}`}>
            <h2 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Critical events</h2>
            {renderRows(criticalLogs)}
          </section>
        )}

        {active === 'ml' && (
          <section className={`rounded-xl border p-4 ${tableShell}`}>
            <h2 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              ML traffic threat pipeline
            </h2>
            <p className={`text-sm mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Real-time classifications from the traffic-security service (normal / suspicious / malicious). Enable{' '}
              <code className="text-xs">TRAFFIC_SECURITY_ML_ENABLED=true</code> and run the Python service on{' '}
              <code className="text-xs">TRAFFIC_SECURITY_ML_URL</code>.
            </p>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className={darkMode ? 'bg-slate-900/80' : 'bg-slate-100'}>
                  <tr>
                    <th className="text-left p-2 font-semibold">Time</th>
                    <th className="text-left p-2 font-semibold">Label</th>
                    <th className="text-left p-2 font-semibold">Confidence</th>
                    <th className="text-left p-2 font-semibold">Method</th>
                    <th className="text-left p-2 font-semibold">Path</th>
                    <th className="text-left p-2 font-semibold">IP</th>
                    <th className="text-left p-2 font-semibold">User</th>
                    <th className="text-left p-2 font-semibold">Families</th>
                  </tr>
                </thead>
                <tbody>
                  {threatMl.map((r) => (
                    <tr
                      key={r.id}
                      className={`border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}
                    >
                      <td className="p-2 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                      <td className="p-2 font-medium">{r.label}</td>
                      <td className="p-2">{(r.confidence * 100).toFixed(1)}%</td>
                      <td className="p-2">{r.http_method}</td>
                      <td className="p-2 max-w-xs truncate font-mono text-xs" title={r.path}>
                        {r.path}
                      </td>
                      <td className="p-2 font-mono text-xs">{r.ip_address}</td>
                      <td className="p-2">{r.user_id ?? '—'}</td>
                      <td className="p-2 max-w-xs truncate text-xs" title={r.attack_families ?? ''}>
                        {r.attack_families ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {active === 'blocked' && (
          <section className={`rounded-xl border p-4 ${tableShell}`}>
            <h2 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Blocked users & IPs</h2>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className={darkMode ? 'bg-slate-900/80' : 'bg-slate-100'}>
                  <tr>
                    <th className="text-left p-2 font-semibold">Blocked at</th>
                    <th className="text-left p-2 font-semibold">User id</th>
                    <th className="text-left p-2 font-semibold">IP</th>
                    <th className="text-left p-2 font-semibold">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {blocked.map((r) => (
                    <tr
                      key={r.id}
                      className={`border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}
                    >
                      <td className="p-2 whitespace-nowrap">{new Date(r.blocked_at).toLocaleString()}</td>
                      <td className="p-2">{r.user_id ?? '—'}</td>
                      <td className="p-2 font-mono text-xs">{r.ip_address ?? '—'}</td>
                      <td className="p-2">{r.reason ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
};

export default SecurityMonitoringPage;
