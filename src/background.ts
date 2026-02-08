import type { ProductContext } from "./types";

const productByTab: Record<number, ProductContext> = {};

chrome.runtime.onMessage.addListener(
  (
    msg: { type: string; product?: ProductContext; tabId?: number },
    sender,
    sendResponse: (r: unknown) => void
  ) => {
    if (msg.type === "PRODUCT_EXTRACTED" && msg.product && sender.tab?.id) {
      productByTab[sender.tab.id] = msg.product;
      sendResponse({ ok: true });
      return true;
    }
    if (msg.type === "GET_PRODUCT") {
      const tabId = msg.tabId ?? sender.tab?.id;
      const product = tabId != null ? productByTab[tabId] ?? null : null;
      sendResponse({ product });
      return true;
    }
    return false;
  }
);
