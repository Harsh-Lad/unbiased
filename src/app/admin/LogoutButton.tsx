"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }
  return (
    <button
      onClick={logout}
      className="bg-black text-white dark:bg-white dark:text-black font-bold uppercase px-4 py-2 rounded-lg border-2 border-black dark:border-white"
    >
      Logout
    </button>
  );
}
