import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Generate from "./pages/Generate";
import Gallery from "./pages/Gallery";

/* Lazy-load secondary pages */
const Pricing = lazy(() => import("./pages/Pricing"));
const Changelog = lazy(() => import("./pages/Changelog"));
const Roadmap = lazy(() => import("./pages/Roadmap"));
const Privacy = lazy(() => import("./pages/legal/Privacy"));
const Terms = lazy(() => import("./pages/legal/Terms"));
const Cookies = lazy(() => import("./pages/legal/Cookies"));
const Imprint = lazy(() => import("./pages/legal/Imprint"));
const NotFound = lazy(() => import("./pages/NotFound"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-6 h-6 border-2 border-[var(--ember)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Pages with their own navbar + footer (no Layout wrapper) */}
          <Route path="/" element={<Home />} />
          <Route path="generate" element={<Generate />} />
          <Route path="gallery" element={<Gallery />} />

          {/* Pages using shared Layout (old navbar + footer) */}
          <Route element={<Layout />}>
            <Route path="landing" element={<Landing />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="changelog" element={<Changelog />} />
            <Route path="roadmap" element={<Roadmap />} />
            <Route path="legal/privacy" element={<Privacy />} />
            <Route path="legal/terms" element={<Terms />} />
            <Route path="legal/cookies" element={<Cookies />} />
            <Route path="legal/imprint" element={<Imprint />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
