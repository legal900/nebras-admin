import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen flex flex-col items-center justify-center bg-[#0B1F3A] text-white p-8"
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#C8A96A] mb-4">
          مرحباً بك في لوحة الإدارة
        </h1>
        <p className="text-gray-400 text-sm">{user.email}</p>
      </div>
    </main>
  );
}
