import { createClientFromRequest } from "npm:@base44/sdk";

const ALTERNATIVES_SCHEMA = {
  type: "object",
  properties: {
    alternatives: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string", description: "Product title" },
          url: { type: "string", description: "Product page URL" },
          price: { type: "string", description: "Price display string" },
          source: { type: "string", description: "Retailer/site name" },
        },
        required: ["title", "url"],
      },
    },
  },
  required: ["alternatives"],
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const title = body.title ?? "";
    const price = body.price ?? "";
    const categoryOrSpecs = body.categoryOrSpecs ?? "";
    const currentUrl = body.currentUrl ?? "";

    const prompt = `You are a shopping assistant. Find 3-5 real product alternatives that are comparable to what the user is viewing. Prefer similar or better value (same or lower price, similar specs for electronics, or similar style/size for apparel).

Current product context:
- Title: ${title || "unknown"}
- Price: ${price || "unknown"}
- Category/specs: ${categoryOrSpecs || "unknown"}
- Page URL: ${currentUrl || "unknown"}

Search the web for real, currently available products. Return a JSON object with an "alternatives" array. Each alternative must have: title (string), url (string, real product page URL), price (string, e.g. "$99.99"), source (string, retailer name). Use only real URLs you find from search; do not make up URLs.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: ALTERNATIVES_SCHEMA,
    });

    return Response.json(
      typeof response === "object" && response !== null
        ? response
        : { alternatives: [] }
    );
  } catch (err) {
    console.error("find-product-alternatives error:", err);
    return Response.json(
      { error: err?.message ?? "Failed to find alternatives" },
      { status: 500 }
    );
  }
});
