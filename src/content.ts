import { extractProduct } from "./content/extractors";

function run() {
  const product = extractProduct(window.location.href, document);
  if (!product) return;
  chrome.runtime.sendMessage({ type: "PRODUCT_EXTRACTED", product });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", run);
} else {
  run();
}
