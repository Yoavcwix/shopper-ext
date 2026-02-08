export type ProductContext = {
  title: string;
  price: string;
  categoryOrSpecs: string;
  currentUrl: string;
  source?: string;
};

function getMeta(name: string): string {
  const el =
    document.querySelector(`meta[property="${name}"]`) ||
    document.querySelector(`meta[name="${name}"]`);
  return (el?.getAttribute("content") ?? "").trim();
}

function getText(selector: string): string {
  const el = document.querySelector(selector);
  return (el?.textContent ?? "").trim().replace(/\s+/g, " ");
}

const SITE_CONFIG: Array<{
  pattern: RegExp;
  source: string;
  selectors: { title: string; price: string; category?: string };
}> = [
  {
    pattern: /amazon\.(com|co\.uk)\/.*\/dp\/|amazon\.(com|co\.uk)\/dp\//i,
    source: "Amazon",
    selectors: {
      title: "#productTitle",
      price: ".a-price .a-offscreen, #priceblock_ourprice, #priceblock_dealprice",
      category: "#wayfinding-breadcrumbs_container a",
    },
  },
  {
    pattern: /ebay\.com\/itm\//i,
    source: "eBay",
    selectors: {
      title: ".x-item-title__mainTitle, h1.it-ttl",
      price: ".x-price-primary .ux-textspans",
      category: ".ux-breadcrumb__text",
    },
  },
  {
    pattern: /bestbuy\.com\/site\//i,
    source: "Best Buy",
    selectors: {
      title: ".sku-title h1, .heading-5",
      price: ".priceView-customer-price span",
      category: ".breadcrumb a",
    },
  },
  {
    pattern: /temu\.com/i,
    source: "Temu",
    selectors: {
      title: "[data-pl='product-title'], .title",
      price: "[data-pl='product-price'], .price",
      category: "",
    },
  },
  {
    pattern: /aliexpress\.com\/item\//i,
    source: "AliExpress",
    selectors: {
      title: ".product-title-text, h1",
      price: ".product-price-value, .uniform-banner-box-price",
      category: ".breadcrumb a",
    },
  },
];

export function extractProduct(url: string, doc: Document): ProductContext | null {
  const fullUrl = url;
  const hostConfig = SITE_CONFIG.find((c) => c.pattern.test(url));
  if (!hostConfig) return null;

  const { source, selectors } = hostConfig;
  let title =
    getText(selectors.title) ||
    getMeta("og:title") ||
    doc.title ||
    "";
  let price = getText(selectors.price) || "";
  let categoryOrSpecs = selectors.category ? getText(selectors.category) : "";

  if (!title && !price) {
    title = getMeta("og:title") || doc.title || "Product";
  }

  return {
    title: title || "Product",
    price,
    categoryOrSpecs,
    currentUrl: fullUrl,
    source,
  };
}
