import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { PopupView } from "./PopupView";
import { WishlistPage } from "./WishlistPage";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<PopupView />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
