import { useEffect, useState } from "react";
import { base44, type WishlistItemRecord } from "./lib/base44";
import { Link } from "react-router-dom";

export function WishlistPage() {
  const [items, setItems] = useState<WishlistItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u ? { email: u.email } : null);
        if (u) {
          const list = await base44.entities.WishlistItem.list("-created_date", 100, 0);
          setItems(Array.isArray(list) ? list : []);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load wishlist");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const remove = async (id: string) => {
    try {
      await base44.entities.WishlistItem.delete(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err: unknown) {
      console.error("Delete failed:", err);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <p>Loading wishlist…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <p>Please log in to view your wishlist.</p>
        <Link to="/">Open extension</Link>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <p style={{ color: "#b91c1c" }}>{error}</p>
        <Link to="/">Open extension</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Wishlist</h1>
        <Link to="/">Back to extension</Link>
      </div>
      {items.length === 0 ? (
        <p style={{ color: "#666" }}>No items yet. Find deals on a product page and add alternatives to your wishlist.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {items.map((item) => (
            <li
              key={item.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: 12,
                marginBottom: 10,
              }}
            >
              <a href={item.product_url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600 }}>
                {item.product_title}
              </a>
              {item.price && <p style={{ margin: "4px 0", fontSize: 14 }}>{item.price}</p>}
              {item.source_site && <p style={{ margin: "0 0 8px", fontSize: 12, color: "#666" }}>{item.source_site}</p>}
              <button
                type="button"
                onClick={() => remove(item.id)}
                style={{
                  padding: "4px 10px",
                  fontSize: 12,
                  border: "1px solid #dc2626",
                  background: "transparent",
                  color: "#dc2626",
                  borderRadius: 4,
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
