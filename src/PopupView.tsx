import { useEffect, useState } from "react";
import { base44, type ProductAlternative } from "./lib/base44";
import { parseAlternativesFromContent } from "./lib/parseAlternatives";
import type { ProductContext } from "./types";
import { LoginRegister } from "./LoginRegister";
import { DealResults } from "./DealResults";

export function PopupView() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [product, setProduct] = useState<ProductContext | null>(null);
  const [findingDeals, setFindingDeals] = useState(false);
  const [alternatives, setAlternatives] = useState<ProductAlternative[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u ? { id: u.id, email: u.email } : null);
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id) return;
      chrome.runtime.sendMessage(
        { type: "GET_PRODUCT", tabId: tab.id },
        (res: { product?: ProductContext } | undefined) => {
          setProduct(res?.product ?? null);
        }
      );
    });
  }, []);

  const handleFindDeals = async () => {
    if (!user || !product) return;
    setFindingDeals(true);
    setError(null);
    setAlternatives([]);
    try {
      const conversation = await base44.agents.createConversation({
        agent_name: "deal_finder",
        metadata: { source: product.source },
      });
      const productText = [
        product.title && `Title: ${product.title}`,
        product.price && `Price: ${product.price}`,
        product.categoryOrSpecs && `Category/specs: ${product.categoryOrSpecs}`,
        product.currentUrl && `Page URL: ${product.currentUrl}`,
      ]
        .filter(Boolean)
        .join("\n");
      await base44.agents.addMessage(conversation, {
        role: "user",
        content: `Find better or similar product alternatives for this product:\n\n${productText}`,
      });
      function setAlternativesFromMessage(lastAssistant: { content?: string; tool_calls?: Array<{ results?: string }> }) {
        const toolCalls = lastAssistant.tool_calls;
        if (toolCalls?.length) {
          for (const tc of toolCalls) {
            try {
              const data = typeof tc.results === "string" ? JSON.parse(tc.results) : tc.results;
              if (data?.alternatives?.length) {
                setAlternatives(data.alternatives);
                return;
              }
            } catch {
              // ignore
            }
          }
        }
        const content = typeof lastAssistant.content === "string" ? lastAssistant.content : "";
        const parsed = parseAlternativesFromContent(content);
        if (parsed.length > 0) setAlternatives(parsed);
      }

      const unsubscribe = base44.agents.subscribeToConversation(
        conversation.id,
        (updated) => {
          const messages = updated.messages ?? [];
          const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
          if (lastAssistant) setAlternativesFromMessage(lastAssistant as { content?: string; tool_calls?: Array<{ results?: string }> });
        }
      );
      const poll = setInterval(async () => {
        const conv = await base44.agents.getConversation(conversation.id);
        const messages = conv?.messages ?? [];
        const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
        if (lastAssistant) {
          clearInterval(poll);
          unsubscribe();
          setAlternativesFromMessage(lastAssistant as { content?: string; tool_calls?: Array<{ results?: string }> });
          setFindingDeals(false);
        }
      }, 1500);
      setTimeout(() => {
        clearInterval(poll);
        unsubscribe();
        setFindingDeals(false);
      }, 60000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to find deals");
      setFindingDeals(false);
    }
  };

  const addToWishlist = async (alt: ProductAlternative) => {
    if (!user) return;
    try {
      await base44.entities.WishlistItem.create({
        product_title: alt.title,
        product_url: alt.url,
        price: alt.price ?? "",
        source_site: alt.source ?? "",
        created_by: user.email,
      });
    } catch (err: unknown) {
      console.error("Add to wishlist failed:", err);
    }
  };

  const openWishlist = () => {
    const url = chrome.runtime.getURL("index.html#/wishlist");
    chrome.tabs.create({ url });
  };

  if (authLoading) {
    return (
      <div style={{ padding: 16, textAlign: "center" }}>
        <p>Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: 16 }}>
        <LoginRegister onLoggedIn={(u) => setUser({ id: u.id, email: u.email })} />
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <strong>Shopper Assistant</strong>
        <button
          type="button"
          onClick={() => {
            base44.auth.logout();
            setUser(null);
          }}
          style={{ fontSize: 12 }}
        >
          Log out
        </button>
      </div>
      {product ? (
        <div style={{ marginBottom: 12 }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, color: "#666" }}>Current product</p>
          <p style={{ margin: 0, fontWeight: 600 }}>{product.title}</p>
          {product.price && <p style={{ margin: "4px 0 0", fontSize: 13 }}>{product.price}</p>}
          <button
            type="button"
            onClick={handleFindDeals}
            disabled={findingDeals}
            style={{
              marginTop: 10,
              padding: "8px 14px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: 6,
            }}
          >
            {findingDeals ? "Searching…" : "Find better deals"}
          </button>
        </div>
      ) : (
        <p style={{ color: "#666", marginBottom: 12 }}>
          Open a product page on Amazon, eBay, Best Buy, Temu, or AliExpress to find deals.
        </p>
      )}
      {error && <p style={{ color: "#b91c1c", margin: "8px 0", fontSize: 13 }}>{error}</p>}
      {alternatives.length > 0 && (
        <DealResults alternatives={alternatives} onAddToWishlist={addToWishlist} />
      )}
      <p style={{ marginTop: 16, fontSize: 12 }}>
        <a href="#" onClick={(e) => { e.preventDefault(); openWishlist(); }}>
          View wishlist
        </a>
      </p>
    </div>
  );
}
