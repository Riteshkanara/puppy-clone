import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import HomePage from "./pages/HomePage";
import PuppiesPage from "./pages/PuppiesPage";
import GoneHomePage from "./pages/GoneHomePage";
import HappyFamiliesPage from "./pages/HappyFamiliesPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import FAQPage from "./pages/FAQPage";
import ContactPage from "./pages/ContactPage";
import PuppyDetailPage from "./pages/puppies/PuppyDetailPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/puppies" element={<PuppiesPage />} />
          <Route path="/gone-home" element={<GoneHomePage />} />
          <Route path="/happy-families" element={<HappyFamiliesPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/puppies/:slug" element={<PuppyDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;