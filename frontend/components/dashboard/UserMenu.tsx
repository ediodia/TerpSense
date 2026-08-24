"use client";

import { signOut } from "next-auth/react";

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserMenu({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-zinc-950 rounded-full flex items-center justify-center text-sm font-black text-emerald-400 shadow-inner border border-white/5">
        {initials(name)}
      </div>
      <div>
        <p className="text-sm font-bold text-white tracking-tight">{name}</p>
        <p className="text-xs font-medium text-zinc-500">Personal budget</p>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="ml-2 flex items-center justify-center px-3 h-9 bg-zinc-800/60 hover:bg-zinc-700/80 text-xs font-bold text-zinc-300 rounded-xl transition-all border border-white/5 cursor-pointer"
      >
        Log out
      </button>
    </div>
  );
}
