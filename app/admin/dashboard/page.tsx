import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Users, BookOpen, CreditCard, DollarSign } from "lucide-react";

const stats = [
  { label: "إجمالي المستخدمين", value: "0",      icon: Users },
  { label: "المحتوى القانوني",  value: "0",      icon: BookOpen },
  { label: "الاشتراكات النشطة", value: "0",      icon: CreditCard },
  { label: "إجمالي الإيرادات",  value: "0 ريال", icon: DollarSign },
];

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  return (
    <div>
      <h2 className="text-white text-xl font-semibold mb-6">نظرة عامة</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="bg-[#0A1628] border border-white/10 rounded-2xl p-6 flex items-center justify-between"
          >
            <div>
              <p className="text-gray-400 text-sm mb-1">{label}</p>
              <p className="text-white text-2xl font-bold">{value}</p>
            </div>
            <div className="bg-[#C8A96A]/10 border border-[#C8A96A]/20 rounded-xl p-3">
              <Icon size={22} className="text-[#C8A96A]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
