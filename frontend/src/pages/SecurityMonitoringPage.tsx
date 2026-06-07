import React, { useEffect, useState } from 'react';
import { ApiError } from '@/api/client';
import { AppShell, AppShellNavItem } from '@/components/AppShell';
import { Shield, List, AlertOctagon, Ban, RefreshCw, Loader2, Radar } from 'lucide-react';
import {
  adminAttackSimApi,
  adminSecurityApi,
  userApi,
  type AttackSimulationLogRow,
  type BlockedEntityRow,
  type SecurityLogRow,
  type ThreatMlEventRow,
} from '@/services/api';

function extractApiErrorMessage(err: unknown): string {
  if (err instanceof ApiError || (err instanceof Error && 'response' in err)) {
    const axErr = err as ApiError & { response?: { status?: number; data?: unknown } };
    const data = (axErr.body ?? axErr.response?.data) as Record<string, unknown> | string | undefined;
    if (data && typeof data === 'object') {
      const msg = data.message ?? data.error;
      if (msg != null && String(msg).length > 0) return String(msg);
    }
    if (typeof data === 'string' && data.length > 0) return data;
    if (axErr.status ?? axErr.response?.status)
      return `Request failed (HTTP ${axErr.status ?? axErr.response?.status})`;
    if (axErr.message) return axErr.message;
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}

function isPlausibleIpv4(s: string | null | undefined): s is string {
  if (!s || typeof s !== 'string') return false;
  const t = s.trim();
  if (t === '' || t.toLowerCase() === 'n/a' || t === '—') return false;
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(t);
}

function parseAttackSimSourceIp(details: string): string | null {
  const m = details.match(/source_http_ip=([^\s]+)/);
  if (!m?.[1]) return null;
  const v = m[1].trim();
  if (v.toLowerCase() === 'n/a' || !isPlausibleIpv4(v)) return null;
  return v;
}

function parseDetailsLooseIp(details: string): string | null {
  const m = details.match(/\bip=([^\s|]+)/i);
  if (!m?.[1]) return null;
  const v = m[1].trim();
  return isPlausibleIpv4(v) ? v : null;
}

interface MaliciousFeedRow {
  id: string;
  source: string;
  when: string;
  kind: string;
  details: string;
  blockIp: string | null;
  blockUserId: string | null;
}

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
  const [active, setActive] = useState<'logs' | 'critical' | 'blocked' | 'ml' | 'malicious'>('logs');
  const [logs, setLogs] = useState<SecurityLogRow[]>([]);
  const [criticalLogs, setCriticalLogs] = useState<SecurityLogRow[]>([]);
  const [blocked, setBlocked] = useState<BlockedEntityRow[]>([]);
  const [threatMl, setThreatMl] = useState<ThreatMlEventRow[]>([]);
  const [attackSimLogs, setAttackSimLogs] = useState<AttackSimulationLogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [blockingId, setBlockingId] = useState<string | null>(null);

  const navItems: AppShellNavItem[] = [
    { id: 'logs', icon: List, label: 'All logs' },
    { id: 'critical', icon: AlertOctagon, label: 'Critical' },
    { id: 'malicious', icon: Shield, label: 'Malicious' },
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
      const [l, c, b, m, a] = await Promise.all([
        adminSecurityApi.getLogs(150),
        adminSecurityApi.getCriticalLogs(150),
        adminSecurityApi.getBlocked(),
        adminSecurityApi.getThreatMlEvents(150),
        adminAttackSimApi.getLogs(150),
      ]);
      setLogs(l.data.data ?? []);
      setCriticalLogs(c.data.data ?? []);
      setBlocked(b.data.data ?? []);
      setThreatMl(m.data.data ?? []);
      setAttackSimLogs(a.data.data ?? []);
    } catch (e: unknown) {
      const status = e instanceof ApiError ? e.status : (e as { response?: { status?: number } })?.response?.status;
      if (status === 403) {
        setError('Access denied (not a security admin).');
      } else {
        setError(extractApiErrorMessage(e));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (allowed) void load();
  }, [allowed]);

  const tableShell =
    darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200';

  const maliciousSummary: MaliciousFeedRow[] = [
    ...threatMl
      .filter((r) => r.label.toLowerCase() !== 'normal')
      .map((r) => {
        const ip = isPlausibleIpv4(r.ip_address) ? r.ip_address.trim() : null;
        return {
          id: `ml-${r.id}`,
          source: 'Traffic ML',
          when: r.created_at,
          kind: `${r.label.toUpperCase()} (${(r.confidence * 100).toFixed(1)}%)`,
          details: `${r.http_method} ${r.path} | ip=${r.ip_address} | families=${r.attack_families ?? 'n/a'}`,
          blockIp: ip,
          blockUserId: r.user_id && /^\d+$/.test(String(r.user_id)) ? String(r.user_id) : null,
        };
      }),
    ...criticalLogs.map((r) => {
      const ip = isPlausibleIpv4(r.ip_address) ? r.ip_address.trim() : parseDetailsLooseIp(r.details ?? '');
      return {
        id: `critical-${r.id}`,
        source: 'Security Log',
        when: r.created_at,
        kind: `${r.action} / ${r.status}`,
        details: `${r.details ?? 'No details'} | ip=${r.ip_address} | user=${r.user_id ?? 'anonymous'}`,
        blockIp: ip,
        blockUserId: r.user_id && /^\d+$/.test(String(r.user_id)) ? String(r.user_id) : null,
      };
    }),
    ...attackSimLogs
      .filter((r) => r.event_type === 'ATTACK_EXECUTED' || r.event_type === 'THREAT_BLOCKED')
      .map((r) => {
        const d = r.details ?? '';
        const ipFromDetails = parseAttackSimSourceIp(d) ?? parseDetailsLooseIp(d);
        return {
          id: `sim-${r.id}`,
          source: 'Attack Simulation',
          when: r.created_at,
          kind: `${r.event_type} / ${r.action}`,
          details: `${d} | actor=${r.actor ?? 'system'} | blocked=${r.blocked ? 'yes' : 'no'}`,
          blockIp: ipFromDetails,
          blockUserId: null,
        };
      }),
  ].sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime());

  const blockIpNow = async (ip: string, rowId: string) => {
    setBlockingId(rowId);
    setActionMessage(null);
    try {
      await adminSecurityApi.blockIp(ip, `Security admin block (${rowId})`);
      setActionMessage(`Blocked IP ${ip}.`);
      await load();
    } catch (e: unknown) {
      setActionMessage(extractApiErrorMessage(e));
    } finally {
      setBlockingId(null);
    }
  };

  const blockUserNow = async (userId: string, rowId: string) => {
    setBlockingId(rowId);
    setActionMessage(null);
    try {
      await adminSecurityApi.blockUser(Number(userId), `Security admin block (${rowId})`);
      setActionMessage(`Blocked user id ${userId}.`);
      await load();
    } catch (e: unknown) {
      setActionMessage(extractApiErrorMessage(e));
    } finally {
      setBlockingId(null);
    }
  };

  const renderRows = (rows: SecurityLogRow[], showBlockActions = false) => (
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
            {showBlockActions && (
              <th className="text-left p-2 font-semibold whitespace-nowrap">Block</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const bip = isPlausibleIpv4(r.ip_address) ? r.ip_address.trim() : null;
            const buid = r.user_id && /^\d+$/.test(String(r.user_id)) ? String(r.user_id) : null;
            const rowKey = `log-${r.id}`;
            return (
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
              {showBlockActions && (
                <td className="p-2 whitespace-nowrap space-x-1">
                  {bip && (
                    <button
                      type="button"
                      disabled={blockingId !== null}
                      onClick={() => void blockIpNow(bip, rowKey)}
                      className="px-2 py-1 rounded text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-40"
                    >
                      {blockingId === rowKey ? '…' : 'IP'}
                    </button>
                  )}
                  {buid && (
                    <button
                      type="button"
                      disabled={blockingId !== null}
                      onClick={() => void blockUserNow(buid, rowKey)}
                      className="px-2 py-1 rounded text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 disabled:opacity-40 dark:bg-slate-600"
                    >
                      {blockingId === rowKey ? '…' : 'User'}
                    </button>
                  )}
                  {!bip && !buid && '—'}
                </td>
              )}
            </tr>
            );
          })}
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
          <div className="rounded-lg border border-red-300 bg-red-50 text-red-900 px-4 py-3 text-sm whitespace-pre-wrap break-words">
            {error}
          </div>
        )}

        {actionMessage && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm whitespace-pre-wrap break-words ${
              actionMessage.startsWith('Blocked')
                ? darkMode
                  ? 'border-emerald-700 bg-emerald-950/60 text-emerald-100'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : darkMode
                  ? 'border-amber-700 bg-amber-950/40 text-amber-100'
                  : 'border-amber-200 bg-amber-50 text-amber-950'
            }`}
          >
            {actionMessage}
            <button
              type="button"
              className="ml-3 text-xs underline opacity-80 hover:opacity-100"
              onClick={() => setActionMessage(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        {active === 'logs' && (
          <section className={`rounded-xl border p-4 ${tableShell}`}>
            <h2 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Audit log</h2>
            {renderRows(logs, true)}
          </section>
        )}

        {active === 'critical' && (
          <section className={`rounded-xl border p-4 ${tableShell}`}>
            <h2 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Critical events</h2>
            {renderRows(criticalLogs, true)}
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
                    <th className="text-left p-2 font-semibold whitespace-nowrap">Block</th>
                  </tr>
                </thead>
                <tbody>
                  {threatMl.map((r) => {
                    const bip = isPlausibleIpv4(r.ip_address) ? r.ip_address.trim() : null;
                    const buid = r.user_id && /^\d+$/.test(String(r.user_id)) ? String(r.user_id) : null;
                    const rowKey = `ml-row-${r.id}`;
                    return (
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
                      <td className="p-2 whitespace-nowrap space-x-1">
                        {bip && (
                          <button
                            type="button"
                            disabled={blockingId !== null}
                            onClick={() => void blockIpNow(bip, rowKey)}
                            className="px-2 py-1 rounded text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-40"
                          >
                            {blockingId === rowKey ? '…' : 'Block IP'}
                          </button>
                        )}
                        {buid && (
                          <button
                            type="button"
                            disabled={blockingId !== null}
                            onClick={() => void blockUserNow(buid, rowKey)}
                            className="px-2 py-1 rounded text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 disabled:opacity-40 dark:bg-slate-600"
                          >
                            {blockingId === rowKey ? '…' : 'Block user'}
                          </button>
                        )}
                        {!bip && !buid && '—'}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {active === 'malicious' && (
          <section className={`rounded-xl border p-4 ${tableShell}`}>
            <h2 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Malicious / Threat details
            </h2>
            <p className={`text-sm mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Combined feed for critical security events, ML malicious classifications, and attack simulation actions.
            </p>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className={darkMode ? 'bg-slate-900/80' : 'bg-slate-100'}>
                  <tr>
                    <th className="text-left p-2 font-semibold">Time</th>
                    <th className="text-left p-2 font-semibold">Source</th>
                    <th className="text-left p-2 font-semibold">Type</th>
                    <th className="text-left p-2 font-semibold">Details</th>
                    <th className="text-left p-2 font-semibold whitespace-nowrap">Block now</th>
                  </tr>
                </thead>
                <tbody>
                  {maliciousSummary.map((r) => (
                    <tr
                      key={r.id}
                      className={`border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}
                    >
                      <td className="p-2 whitespace-nowrap">{new Date(r.when).toLocaleString()}</td>
                      <td className="p-2">{r.source}</td>
                      <td className="p-2">{r.kind}</td>
                      <td className="p-2 max-w-xl truncate" title={r.details}>
                        {r.details}
                      </td>
                      <td className="p-2 whitespace-nowrap space-x-1">
                        {r.blockIp && (
                          <button
                            type="button"
                            disabled={blockingId !== null}
                            onClick={() => void blockIpNow(r.blockIp!, r.id)}
                            className="px-2 py-1 rounded text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-40"
                          >
                            {blockingId === r.id ? '…' : 'Block IP'}
                          </button>
                        )}
                        {r.blockUserId && (
                          <button
                            type="button"
                            disabled={blockingId !== null}
                            onClick={() => void blockUserNow(r.blockUserId!, r.id)}
                            className="px-2 py-1 rounded text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 disabled:opacity-40 dark:bg-slate-600"
                          >
                            {blockingId === r.id ? '…' : 'Block user'}
                          </button>
                        )}
                        {!r.blockIp && !r.blockUserId && (
                          <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                            No IP / user
                          </span>
                        )}
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
