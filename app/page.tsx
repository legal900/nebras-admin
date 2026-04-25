import Image from "next/image";

export default function Home() {
  return (
    <main
      dir="rtl"
      className="min-h-screen flex flex-col items-center justify-center bg-[#0B1F3A] text-white p-8"
    >
      <div className="text-center max-w-2xl">
        <div className="mb-8 flex justify-center">
          <Image
            src="/logo.png"
            alt="نبراس - دليلك القانوني الذكي"
            width={280}
            height={280}
            priority
          />
        </div>

        <p className="text-xl mb-2 text-gray-300">
          دليلك القانوني الذكي
        </p>

        <p className="text-sm mb-12 text-[#2D9CDB] tracking-widest">
          NEBRAS AI
        </p>

        <div className="inline-block bg-[#C8A96A]/20 border border-[#C8A96A] rounded-full px-6 py-2">
          <p className="text-[#C8A96A] text-sm">
            قريباً · لوحة إدارة المنصة
          </p>
        </div>
      </div>
    </main>
  );
}
