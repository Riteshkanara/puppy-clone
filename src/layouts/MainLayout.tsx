import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PawTrail from "../components/PawTrail";
import PageCurtain from "../components/PageCurtain";
import PupJourney from "../components/PupJourney";
import "./MainLayout.css";

function MainLayout() {
  const { pathname } = useLocation();
  return (
    <>
      <PageCurtain />
      <PawTrail />
      <Header />

      <main id="top" className="app-main">
        <Outlet />
        {/* Teddy, the mascot who travels the page (needs the [data-pup-stop] markers; re-measures per route) */}
        <PupJourney key={pathname} />
      </main>

      <Footer />
    </>
  );
}

export default MainLayout;