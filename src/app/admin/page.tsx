import Link from "next/link";
import { listHistory } from "@/lib/history/store";
import { LogoutButton } from "./LogoutButton";

export const dynamic = "force-dynamic";

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

        {/* Vercel Analytics link */}
        <div className="bg-white dark:bg-slate-800 border-4 border-black dark:border-white rounded-2xl p-4 shadow-[6px_6px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_rgba(255,255,255,1)]">
          <div className="font-bold mb-2">📊 Vercel Analytics</div>
          <p className="text-sm opacity-80 mb-2">
            Page views, referrers, and Web Vitals are in your Vercel dashboard.
          </p>
          <Link
            href="https://vercel.com/dashboard"
            target="_blank"
            className="text-blue-700 dark:text-blue-300 underline font-bold"
          >
            Open Vercel Analytics →
          </Link>
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white dark:bg-slate-800 border-4 border-black dark:border-white rounded-2xl p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_rgba(255,255,255,1)]">
      <div className="text-xs font-bold uppercase opacity-70">{label}</div>
      <div className="text-3xl font-black">{value}</div>
    </div>
  );
}
