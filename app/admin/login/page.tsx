"use client";

import Image from "next/image";
import { useActionState } from "react";
import { signIn } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(signIn, null);

  return (
    <main
      dir="rtl"
      className="min-h-screen flex flex-col items-center justify-center bg-[#0B1F3A] text-white p-8"
    >
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="نبراس" width={160} height={160} priority />
        </div>

        <h1 className="text-center text-2xl font-bold text-[#C8A96A] mb-8">
          لوحة الإدارة
        </h1>

        <form
          action={action}
          className="bg-white/5 border border-[#C8A96A]/20 rounded-2xl p-8 space-y-5"
        >
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm text-gray-300">
              البريد الإلكتروني
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              dir="ltr"
              placeholder="admin@example.com"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#C8A96A] transition"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm text-gray-300">
              كلمة المرور
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              dir="ltr"
              placeholder="••••••••"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#C8A96A] transition"
            />
          </div>

          {state?.error && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg px-4 py-3 text-red-300 text-sm">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-[#C8A96A] hover:bg-[#b8934e] disabled:opacity-60 text-[#0B1F3A] font-bold py-3 rounded-lg transition"
          >
            {pending ? "جاري الدخول..." : "دخول"}
          </button>
        </form>
      </div>
    </main>
  );
}
