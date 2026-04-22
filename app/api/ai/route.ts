// app/api/ai/route.ts
// Calls Claude API with real product catalog from Supabase as context.
// Returns text response + parsed product recommendations.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

async function getProductCatalog() {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, price, scent_type, description, image_url, stock, is_active, categories(name)",
    )
    .eq("is_active", true)
    .gt("stock", 0)
    .order("name");

  if (error) {
    console.error("AI catalog fetch:", error.message);
    return [];
  }

  return (data ?? []).map((p: any) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    scent_type: p.scent_type,
    description: p.description,
    image_url: p.image_url,
    category: p.categories?.name ?? "Uncategorised",
  }));
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const products = await getProductCatalog();
    const productContext = products
      .map(
        (p) =>
          `ID: ${p.id} | Name: ${p.name} | Category: ${p.category} | Scent: ${p.scent_type} | Price: ₦${p.price.toLocaleString()} | Description: ${p.description}`,
      )
      .join("\n");

    const systemPrompt = `You are Scentara, the AI fragrance assistant for ScentAI — a luxury perfume boutique in Nigeria. You are warm, knowledgeable, and passionate about fragrance.

You help customers:
- Find the perfect fragrance based on mood, personality, occasion, or preferences
- Learn about scent families, notes, longevity, and sillage
- Get gifting advice for loved ones
- Compare fragrances and understand what makes each unique
- Build a personal scent profile

CURRENT PRODUCT CATALOG (in-stock only):
${productContext}

RECOMMENDATION FORMAT:
When recommending specific products, always include a JSON block at the end of your response in this exact format:
\`\`\`products
[
  {"id": "product-uuid-here", "reason": "Brief reason why this suits them"},
  {"id": "product-uuid-here", "reason": "Brief reason why this suits them"}
]
\`\`\`

RULES:
- Only recommend products from the catalog above using their exact IDs
- Recommend 1–3 products maximum per response
- If no products fit the request, don't include the JSON block
- Keep responses warm and concise — 2–4 sentences before recommendations
- Use ₦ for Nigerian Naira prices
- Never make up products or prices
- If asked about something unrelated to fragrance, gently redirect`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      console.error("Claude API error:", await response.text());
      return NextResponse.json({ error: "AI service error" }, { status: 500 });
    }

    const data = await response.json();
    const fullText = data.content?.[0]?.text ?? "";

    // Parse product recommendations
    const productMatch = fullText.match(/```products\s*([\s\S]*?)```/);
    let recommendedIds: { id: string; reason: string }[] = [];
    if (productMatch) {
      try {
        recommendedIds = JSON.parse(productMatch[1].trim());
      } catch {}
    }

    const cleanText = fullText.replace(/```products[\s\S]*?```/g, "").trim();

    const recommendedProducts = recommendedIds
      .map((rec) => {
        const product = products.find((p) => p.id === rec.id);
        return product ? { ...product, reason: rec.reason } : null;
      })
      .filter(Boolean);

    return NextResponse.json({
      text: cleanText,
      products: recommendedProducts,
    });
  } catch (error) {
    console.error("AI route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
