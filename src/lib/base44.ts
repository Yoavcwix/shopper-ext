import { createClient } from "@base44/sdk";

const appId = import.meta.env.VITE_BASE44_APP_ID ?? "";
if (!appId) {
  console.warn("VITE_BASE44_APP_ID is not set. Set it in .env or .env.local");
}

export const base44 = createClient({ appId });

export type WishlistItemRecord = {
  id: string;
  product_title: string;
  product_url: string;
  price?: string;
  image_url?: string;
  source_site?: string;
  notes?: string;
  created_by: string;
  created_date?: string;
  updated_date?: string;
};

export type ProductAlternative = {
  title: string;
  url: string;
  price?: string;
  source?: string;
};
