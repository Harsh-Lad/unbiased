import Link from "next/link";
import { listHistory, type HistoryEntry } from "@/lib/history/store";
import { LogoutButton } from "./LogoutButton";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function buildVercelLinks() {
  const url = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL || "";
  const projectName = process.env.VERCEL_PROJECT_NAME || url.split(".")[0] || "your-project";
  const base = `https://vercel.com/dashboard`;
  return {
    overview: base,
    analytics: `https://vercel.com/~/${projectName}/analytics`,
    speed: `https://vercel.com/~/${projectName}/speed-insights`,
    logs: `https://vercel.com/~/${projectName}/logs`,
    projectName,
  };
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
  const links = buildVercelLinks();
  const daily = bucketByDay(entries, 7);
  const maxDay = Math.max(1, ...daily.map((d) => d.count));
  const uniqueIps = new Set(entries.map((e) => e.ip).filter(Boolean)).size;
  const successRate = entries.length ? Math.round((successCount / entries.length) * 100) : 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-yellow-50 dark:bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-black uppercase">Admin Dashboard</h1>
          <LogoutButton />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Total" value={entries.length} />
          <Stat label="Success" value={successCount} />
          <Stat label="Failed" value={failCount} />
          <Stat label="Kinds" value={Object.keys(counts).length} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(["youtube", "pdf", "image", "text"] as const).map((k) => (
            <Stat key={k} label={k.toUpperCase()} value={counts[k] || 0} />
          ))}
        </div>

        {/* Daily activity chart */}
        <div className="bg-white dark:bg-slate-800 border-4 border-black dark:border-white rounded-2xl p-4 shadow-[6px_6px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_rgba(255,255,255,1)]">
          <div className="font-black uppercase mb-3">Last 7 Days</div>
          <div className="flex items-end gap-2 h-32">
            {daily.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs font-mono">{d.count || ""}</div>
                <div className="w-full flex flex-col-reverse" style={{ height: "70%" }}>
                  <div
                    className="bg-green-500 border-2 border-black dark:border-white"
                    style={{ height: `${(d.success / maxDay) * 100}%` }}
                    title={`${d.success} success`}
                  />
                  <div
                    className="bg-red-500 border-2 border-b-0 border-black dark:border-white"
                    style={{ height: `${(d.fail / maxDay) * 100}%` }}
                    title={`${d.fail} failed`}
                  />
                </div>
                <div className="text-xs font-bold opacity-70">{d.day}</div>
              </div>
            ))}
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
          <Stat label="Success rate" value={`${successRate}%`} />
          <Stat label="Unique IPs" value={uniqueIps} />
          <Stat label="Today" value={daily[daily.length - 1]?.count ?? 0} />
        </div>

        {/* Vercel Insights links */}
        <div className="bg-white dark:bg-slate-800 border-4 border-black dark:border-white rounded-2xl p-4 shadow-[6px_6px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_rgba(255,255,255,1)] space-y-3">
          <div className="font-black uppercase">📊 Vercel Insights</div>
          <p className="text-sm opacity-80">
            Page views, referrers, Web Vitals, and runtime logs live in your Vercel dashboard
            (Vercel blocks iframe embedding for security).
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <VercelLink href={links.analytics} title="Web Analytics" desc="Visits, referrers, paths" />
            <VercelLink href={links.speed} title="Speed Insights" desc="Web Vitals, real users" />
            <VercelLink href={links.logs} title="Runtime Logs" desc="Server errors" />
            <VercelLink href={links.overview} title="Project" desc="Deploys, env, settings" />
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

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white dark:bg-slate-800 border-4 border-black dark:border-white rounded-2xl p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_rgba(255,255,255,1)]">
      <div className="text-xs font-bold uppercase opacity-70">{label}</div>
      <div className="text-3xl font-black">{value}</div>
    </div>
  );
}

function VercelLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      className="block bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border-2 border-black dark:border-white rounded-xl p-3 transition"
    >
      <div className="font-black text-sm">{title} →</div>
      <div className="text-xs opacity-70 mt-1">{desc}</div>
    </Link>
  );
}
