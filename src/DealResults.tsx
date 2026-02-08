import type { ProductAlternative } from "./lib/base44";

type Props = {
  alternatives: ProductAlternative[];
  onAddToWishlist: (alt: ProductAlternative) => void;
};

export function DealResults({ alternatives, onAddToWishlist }: Props) {
  return (
    <div style={{ marginTop: 12 }}>
      <strong style={{ fontSize: 13 }}>Alternatives</strong>
      <ul style={{ margin: "8px 0 0", paddingLeft: 20, listStyle: "disc" }}>
        {alternatives.map((alt, i) => (
          <li key={i} style={{ marginBottom: 8 }}>
            <a href={alt.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13 }}>
              {alt.title}
            </a>
            {alt.price ? <span style={{ marginLeft: 6, color: "#666" }}>{alt.price}</span> : null}
            {alt.source ? <span style={{ marginLeft: 6, color: "#888", fontSize: 12 }}>({alt.source})</span> : null}
            <br />
            <button
              type="button"
              onClick={() => onAddToWishlist(alt)}
              style={{
                marginTop: 4,
                padding: "4px 8px",
                fontSize: 12,
                border: "1px solid #2563eb",
                background: "transparent",
                color: "#2563eb",
                borderRadius: 4,
              }}
            >
              Add to wishlist
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
