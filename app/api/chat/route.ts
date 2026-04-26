import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type DocRow = {
  id: string;
  title: string;
  type: string;
  source: string;
  year: number;
  content: string;
};

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    if (!question?.trim()) {
      return Response.json({ error: "السؤال مطلوب" }, { status: 400 });
    }

    // 1. تحويل السؤال لـ embedding
    const {
      data: [{ embedding }],
    } = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: question,
    });

    // 2. البحث بالتشابه في Supabase
    const { data: docs, error } = await supabase.rpc("match_legal_documents", {
      query_embedding: embedding,
      match_count: 5,
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (!docs?.length) {
      return Response.json({
        answer:
          "لم أجد مصادر قانونية ذات صلة بسؤالك. يرجى إضافة محتوى قانوني أولاً.",
        sources: [],
      });
    }

    // 3. بناء السياق من النتائج
    const context = (docs as DocRow[])
      .map(
        (d) =>
          `العنوان: ${d.title}\nالمصدر: ${d.source} (${d.year})\n${d.content}`
      )
      .join("\n\n---\n\n");

    // 4. إرسال لـ Claude مع prompt caching
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: "أنت مستشار قانوني متخصص. أجب بالعربية الفصحى مستنداً فقط إلى المصادر القانونية المقدمة. اذكر المصادر التي استندت إليها في نهاية إجابتك.",
          cache_control: { type: "ephemeral" },
        },
      ] as Anthropic.TextBlockParam[],
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `المصادر القانونية المتاحة:\n\n${context}`,
              cache_control: { type: "ephemeral" },
            },
            {
              type: "text",
              text: `السؤال: ${question}`,
            },
          ] as Anthropic.ContentBlockParam[],
        },
      ],
    });

    const answer =
      message.content[0].type === "text" ? message.content[0].text : "";

    return Response.json({
      answer,
      sources: (docs as DocRow[]).map(({ title, source, year, type }) => ({
        title,
        source,
        year,
        type,
      })),
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "حدث خطأ في المعالجة" }, { status: 500 });
  }
}
