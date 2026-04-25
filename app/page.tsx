import Image from "next/image";
import { supabase } from "@/lib/supabase";

type Plan = {
  id: string;
  name: string;
  price?: number;
  description?: string;
};

export default async function Home() {
  const { data: plans, error } = await supabase
    .from("subscription_plans")
    .select("*");

  return (
    <main
      dir="rtl"
      className="min-h-screen flex flex-col items-center justify-center bg-[#0B1F3A] text-white p-8"
    >
      <div className="text-center max-w-2xl w-full">
        <div className="mb-8 flex justify-center">
          <Image
            src="/logo.png"
            alt="نبراس - دليلك القانوني الذكي"
            width={280}
            height={280}
            priority
          />
        </div>

        <p className="text-xl mb-2 text-gray-300">دليلك القانوني الذكي</p>

        <p className="text-sm mb-12 text-[#2D9CDB] tracking-widest">
          NEBRAS AI
        </p>

        <div className="mb-8">
          <h2 className="text-[#C8A96A] text-lg mb-4 font-semibold">
            خطط الاشتراك — اختبار Supabase
          </h2>

          {error ? (
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 text-red-300 text-sm">
              خطأ في الاتصال: {error.message}
            </div>
          ) : !plans || plans.length === 0 ? (
            <div className="bg-[#C8A96A]/10 border border-[#C8A96A]/40 rounded-lg p-4 text-gray-400 text-sm">
              لا توجد بيانات في جدول subscription_plans
            </div>
          ) : (
            <div className="grid gap-4">
              {plans.map((plan: Plan) => (
                <div
                  key={plan.id}
                  className="bg-white/5 border border-[#C8A96A]/30 rounded-xl p-4 text-right"
                >
                  <p className="text-[#C8A96A] font-semibold">{plan.name}</p>
                  {plan.price !== undefined && (
                    <p className="text-gray-300 text-sm mt-1">{plan.price} ريال</p>
                  )}
                  {plan.description && (
                    <p className="text-gray-400 text-xs mt-1">{plan.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="inline-block bg-[#C8A96A]/20 border border-[#C8A96A] rounded-full px-6 py-2">
          <p className="text-[#C8A96A] text-sm">قريباً · لوحة إدارة المنصة</p>
        </div>
      </div>
    </main>
  );
}
