"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Plus, Search, X, ChevronRight, ChevronLeft } from "lucide-react";

type LegalDocument = {
  id: string;
  title: string;
  type: string;
  source: string;
  year: number;
  content: string;
  status: string;
  created_at: string;
};

const TYPE_OPTIONS = [
  { value: "law",        label: "قوانين" },
  { value: "cassation",  label: "أحكام نقض" },
  { value: "regulation", label: "لوائح تنفيذية" },
  { value: "decree",     label: "مراسيم" },
];

const TYPE_LABELS: Record<string, string> = {
  law:        "قوانين",
  cassation:  "أحكام نقض",
  regulation: "لوائح تنفيذية",
  decree:     "مراسيم",
};

const PAGE_SIZE = 10;

const EMPTY_FORM = {
  title:   "",
  type:    "law",
  source:  "",
  year:    new Date().getFullYear().toString(),
  content: "",
};

export default function LegalContentClient() {
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const [items,        setItems]        = useState<LegalDocument[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [totalCount,   setTotalCount]   = useState(0);
  const [page,         setPage]         = useState(0);
  const [search,       setSearch]       = useState("");
  const [typeFilter,   setTypeFilter]   = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal,    setShowModal]    = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [savingMsg,    setSavingMsg]    = useState("جاري الحفظ...");
  const [saveError,    setSaveError]    = useState<string | null>(null);
  const [form,         setForm]         = useState(EMPTY_FORM);

  const fetchData = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("public_legal_documents")
      .select("*", { count: "exact" });

    if (search)                 query = query.ilike("title", `%${search}%`);
    if (typeFilter !== "all")   query = query.eq("type", typeFilter);
    if (statusFilter !== "all") query = query.eq("status", statusFilter);

    const { data, count } = await query
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    setItems(data ?? []);
    setTotalCount(count ?? 0);
    setLoading(false);
  }, [supabase, search, typeFilter, statusFilter, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setForm(EMPTY_FORM);
    setSaveError(null);
  }, []);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.source.trim() || !form.content.trim()) {
      setSaveError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    setSaving(true);
    setSavingMsg("جاري الحفظ...");
    setSaveError(null);

    const { data: inserted, error } = await supabase
      .from("public_legal_documents")
      .insert({
        title:   form.title.trim(),
        type:    form.type,
        source:  form.source.trim(),
        year:    parseInt(form.year),
        content: form.content.trim(),
        status:  "draft",
      })
      .select("id")
      .single();

    if (error || !inserted) {
      setSaveError("حدث خطأ أثناء الحفظ");
      setSaving(false);
      return;
    }

    setSavingMsg("جاري معالجة المحتوى...");

    await fetch("/api/embeddings", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id: inserted.id, content: form.content.trim() }),
    });

    closeModal();
    if (page === 0) fetchData();
    else setPage(0);
    setSaving(false);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-xl font-semibold">المحتوى القانوني</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#C8A96A] hover:bg-[#b8934e] text-[#0B1F3A] font-semibold px-4 py-2 rounded-xl text-sm transition"
        >
          <Plus size={16} />
          إضافة محتوى جديد
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-52">
          <Search
            size={15}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="بحث في المحتوى..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-full bg-[#0A1628] border border-white/10 rounded-xl pr-9 pl-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C8A96A]/50 transition"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
          className="bg-[#0A1628] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C8A96A]/50 transition cursor-pointer"
        >
          <option value="all">جميع الأنواع</option>
          {TYPE_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="bg-[#0A1628] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C8A96A]/50 transition cursor-pointer"
        >
          <option value="all">جميع الحالات</option>
          <option value="published">منشور</option>
          <option value="draft">مسودة</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#0A1628] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-right text-gray-400 font-medium px-6 py-4">العنوان</th>
                <th className="text-right text-gray-400 font-medium px-6 py-4">النوع</th>
                <th className="text-right text-gray-400 font-medium px-6 py-4 hidden md:table-cell">المصدر</th>
                <th className="text-right text-gray-400 font-medium px-6 py-4 hidden lg:table-cell">تاريخ الإضافة</th>
                <th className="text-right text-gray-400 font-medium px-6 py-4">الحالة</th>
                <th className="text-right text-gray-400 font-medium px-6 py-4">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 py-16">
                    جاري التحميل...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 py-16">
                    لا يوجد محتوى قانوني بعد
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition"
                  >
                    <td className="px-6 py-4 text-white font-medium max-w-xs">
                      <span className="block truncate">{item.title}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {TYPE_LABELS[item.type] ?? item.type}
                    </td>
                    <td className="px-6 py-4 text-gray-400 hidden md:table-cell">
                      {item.source}
                    </td>
                    <td className="px-6 py-4 text-gray-400 hidden lg:table-cell">
                      {new Date(item.created_at).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          item.status === "published"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                        }`}
                      >
                        {item.status === "published" ? "منشور" : "مسودة"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-gray-400 hover:text-[#C8A96A] text-xs transition">
                        تعديل
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
            <span className="text-gray-400 text-sm">
              {totalCount} نتيجة · صفحة {page + 1} من {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            dir="rtl"
            className="bg-[#0A1628] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="text-white font-semibold text-lg">إضافة محتوى جديد</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm text-gray-300">
                  عنوان المستند <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="أدخل عنوان المستند"
                  className="w-full bg-[#0B1F3A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C8A96A]/50 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm text-gray-300">
                    نوع المستند <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-[#0B1F3A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C8A96A]/50 transition"
                  >
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm text-gray-300">
                    سنة الإصدار <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full bg-[#0B1F3A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C8A96A]/50 transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm text-gray-300">
                  المصدر / الجهة المصدرة <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  placeholder="مثال: وزارة العدل"
                  className="w-full bg-[#0B1F3A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C8A96A]/50 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm text-gray-300">
                  المحتوى النصي <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="أدخل نص المستند القانوني..."
                  rows={8}
                  className="w-full bg-[#0B1F3A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C8A96A]/50 transition resize-none"
                />
              </div>

              {saveError && (
                <div className="bg-red-900/30 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
                  {saveError}
                </div>
              )}
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-white/10">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 bg-[#C8A96A] hover:bg-[#b8934e] disabled:opacity-60 text-[#0B1F3A] font-semibold py-3 rounded-xl text-sm transition"
              >
                {saving ? savingMsg : "حفظ"}
              </button>
              <button
                onClick={closeModal}
                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-medium py-3 rounded-xl text-sm transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
