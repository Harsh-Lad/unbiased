import Link from "next/link";
import { Info } from "lucide-react";
import { listHistory, type HistoryEntry } from "@/lib/history/store";
import { LogoutButton } from "./LogoutButton";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function topVideos(entries: HistoryEntry[], n = 5) {
  const counts = new Map<string, { videoId: string; input: string; count: number; success: number }>();
  for (const e of entries) {
    if (e.kind !== "youtube" || !e.videoId) continue;
    const cur = counts.get(e.videoId) || { videoId: e.videoId, input: e.input, count: 0, success: 0 };
    cur.count++;
    if (e.success) cur.success++;
    counts.set(e.videoId, cur);
  }
  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, n);
}

function errorBreakdown(entries: HistoryEntry[]) {
  const counts = new Map<string, number>();
  for (const e of entries) {
    if (e.success) continue;
    const code = e.errorCode || "UNKNOWN";
    counts.set(code, (counts.get(code) || 0) + 1);
  }
  return [...counts.entries()].map(([code, count]) => ({ code, count })).sort((a, b) => b.count - a.count);
}

function bucketByDay(entries: HistoryEntry[], days = 7) {
  const now = new Date();
  const buckets: { day: string; count: number; success: number; fail: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    buckets.push({
      day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      count: 0,
      success: 0,
      fail: 0,
    });
  }
  const startMs = (() => {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (days - 1));
    return d.getTime();
  })();
  entries.forEach((e) => {
    if (e.ts < startMs) return;
    const d = new Date(e.ts);
    d.setHours(0, 0, 0, 0);
    const idx = Math.floor((d.getTime() - startMs) / 86400000);
    if (idx >= 0 && idx < buckets.length) {
      buckets[idx].count++;
      if (e.success) buckets[idx].success++;
      else buckets[idx].fail++;
    }
  });
  return buckets;
}

function fmtTs(ts: number): string {
  return new Date(ts).toLocaleString();
}

function badge(kind: string): string {
  switch (kind) {
    case "youtube": return "bg-red-100 text-red-900 border-red-900";
    case "pdf": return "bg-blue-100 text-blue-900 border-blue-900";
    case "image": return "bg-green-100 text-green-900 border-green-900";
    case "text": return "bg-purple-100 text-purple-900 border-purple-900";
    default: return "bg-slate-100 text-slate-900 border-slate-900";
  }
}

export default async function AdminPage() {
  const entries = await listHistory(200);
  const counts = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.kind] = (acc[e.kind] || 0) + 1;
    return acc;
  }, {});
  const successCount = entries.filter((e) => e.success).length;
  const failCount = entries.length - successCount;
  const daily = bucketByDay(entries, 7);
  const maxDay = Math.max(1, ...daily.map((d) => d.count));
  const uniqueIps = new Set(entries.map((e) => e.ip).filter(Boolean)).size;
  const successRate = entries.length ? Math.round((successCount / entries.length) * 100) : 0;
  const errors = errorBreakdown(entries);
  const top = topVideos(entries, 5);
  const maxErr = Math.max(1, ...errors.map((e) => e.count));
  const maxTop = Math.max(1, ...top.map((t) => t.count));

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-yellow-50 dark:bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-black uppercase">Admin Dashboard</h1>
          <LogoutButton />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Total" value={entries.length} tooltip="All analyses logged (last 1000, both successful and failed)." />
          <Stat label="Success" value={successCount} tooltip="Analyses that returned a result without error." />
          <Stat label="Failed" value={failCount} tooltip="Analyses that errored — see 'Failures by reason' below." />
          <Stat label="Kinds" value={Object.keys(counts).length} tooltip="Distinct content types used (youtube / pdf / image / text)." />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(["youtube", "pdf", "image", "text"] as const).map((k) => (
            <Stat key={k} label={k.toUpperCase()} value={counts[k] || 0} tooltip={`Number of ${k} analyses logged.`} />
          ))}
        </div>

        {/* Daily activity chart */}
        <div className="bg-white dark:bg-slate-800 border-4 border-black dark:border-white rounded-2xl p-4 shadow-[6px_6px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_rgba(255,255,255,1)]">
          <div className="font-black uppercase mb-3">Last 7 Days</div>
          <div className="flex items-end gap-2 h-40">
            {daily.map((d) => {
              const totalPct = (d.count / maxDay) * 100;
              const successPct = d.count > 0 ? (d.success / d.count) * 100 : 0;
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1 h-full">
                  <div className="text-xs font-mono h-4">{d.count || ""}</div>
                  <div className="w-full flex-1 flex flex-col justify-end">
                    <div
                      className="w-full border-2 border-black dark:border-white flex flex-col-reverse overflow-hidden rounded-t-sm"
                      style={{ height: `${totalPct}%`, minHeight: d.count > 0 ? "4px" : "0" }}
                      title={`${d.success} ok / ${d.fail} failed`}
                    >
                      <div className="bg-green-500 w-full" style={{ height: `${successPct}%` }} />
                      <div className="bg-red-500 w-full" style={{ height: `${100 - successPct}%` }} />
                    </div>
                  </div>
                  <div className="text-xs font-bold opacity-70">{d.day}</div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-3 text-xs font-bold">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 bg-green-500 border border-black" /> Success
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 bg-red-500 border border-black" /> Failed
            </span>
          </div>
        </div>

        {/* Extra metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Stat label="Success rate" value={`${successRate}%`} tooltip="Successful analyses ÷ total analyses, across the full logged history." />
          <Stat label="Unique IPs" value={uniqueIps} tooltip="Distinct client IPs seen across all logged analyses (rough proxy for distinct users)." />
          <Stat label="Today" value={daily[daily.length - 1]?.count ?? 0} tooltip="Total analyses started today (server local time)." />
        </div>

        {/* Error breakdown + top videos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-800 border-4 border-black dark:border-white rounded-2xl p-4 shadow-[6px_6px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_rgba(255,255,255,1)]">
            <div className="font-black uppercase mb-3">Failures by reason</div>
            {errors.length === 0 ? (
              <div className="text-sm opacity-70">No failures recorded.</div>
            ) : (
              <div className="space-y-2">
                {errors.map((e) => (
                  <div key={e.code} className="flex items-center gap-2">
                    <div className="w-32 text-xs font-mono truncate" title={e.code}>{e.code}</div>
                    <div className="flex-1 h-5 bg-black/5 dark:bg-white/5 border border-black dark:border-white rounded">
                      <div className="h-full bg-red-500" style={{ width: `${(e.count / maxErr) * 100}%` }} />
                    </div>
                    <div className="w-8 text-right text-sm font-bold">{e.count}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 border-4 border-black dark:border-white rounded-2xl p-4 shadow-[6px_6px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_rgba(255,255,255,1)]">
            <div className="font-black uppercase mb-3">Top YouTube videos</div>
            {top.length === 0 ? (
              <div className="text-sm opacity-70">No YouTube analyses yet.</div>
            ) : (
              <div className="space-y-2">
                {top.map((t) => (
                  <div key={t.videoId} className="flex items-center gap-2">
                    <Link
                      href={`https://www.youtube.com/watch?v=${t.videoId}`}
                      target="_blank"
                      className="w-32 text-xs font-mono truncate text-blue-700 dark:text-blue-300 underline"
                      title={t.input}
                    >
                      {t.videoId}
                    </Link>
                    <div className="flex-1 h-5 bg-black/5 dark:bg-white/5 border border-black dark:border-white rounded">
                      <div className="h-full bg-green-500" style={{ width: `${(t.count / maxTop) * 100}%` }} />
                    </div>
                    <div className="w-16 text-right text-xs font-bold">
                      {t.success}/{t.count}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* History table */}
        <div className="bg-white dark:bg-slate-800 border-4 border-black dark:border-white rounded-2xl shadow-[6px_6px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_rgba(255,255,255,1)] overflow-hidden">
          <div className="p-4 border-b-4 border-black dark:border-white font-black uppercase">
            Recent Analyses ({entries.length})
          </div>
          {entries.length === 0 ? (
            <div className="p-6 opacity-70">
              No analyses yet. Either no traffic, or KV is not configured. Set
              <code className="mx-1 px-1 bg-black/10 dark:bg-white/10 rounded">KV_REST_API_URL</code>
              and
              <code className="mx-1 px-1 bg-black/10 dark:bg-white/10 rounded">KV_REST_API_TOKEN</code>
              in env.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-black/5 dark:bg-white/5">
                  <tr className="text-left">
                    <th className="p-3">When</th>
                    <th className="p-3">Kind</th>
                    <th className="p-3">Input</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={e.id} className="border-t border-black/10 dark:border-white/10 align-top">
                      <td className="p-3 whitespace-nowrap font-mono text-xs">{fmtTs(e.ts)}</td>
                      <td className="p-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded border-2 ${badge(e.kind)}`}>
                          {e.kind}
                        </span>
                      </td>
                      <td className="p-3 max-w-xl">
                        {e.kind === "youtube" && e.videoId ? (
                          <Link
                            href={`https://www.youtube.com/watch?v=${e.videoId}`}
                            target="_blank"
                            className="text-blue-700 dark:text-blue-300 underline break-all"
                          >
                            {e.input}
                          </Link>
                        ) : (
                          <span className="break-all whitespace-pre-wrap">{e.input}</span>
                        )}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {e.success ? (
                          <span className="text-green-700 dark:text-green-300 font-bold">✓ ok</span>
                        ) : (
                          <span className="text-red-700 dark:text-red-300 font-bold">
                            ✗ {e.errorCode || "fail"}
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-xs opacity-70">{e.ip || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tooltip }: { label: string; value: number | string; tooltip?: string }) {
  return (
    <div className="relative bg-white dark:bg-slate-800 border-4 border-black dark:border-white rounded-2xl p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_rgba(255,255,255,1)]">
      {tooltip && (
        <span
          tabIndex={0}
          aria-label={tooltip}
          title={tooltip}
          className="absolute top-2 right-2 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white cursor-help focus:outline-none focus-visible:text-black dark:focus-visible:text-white"
        >
          <Info className="w-4 h-4" />
        </span>
      )}
      <div className="text-xs font-bold uppercase opacity-70 pr-6">{label}</div>
      <div className="text-3xl font-black">{value}</div>
    </div>
  );
}

