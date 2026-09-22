import React, { useState, useEffect } from 'react';
import { Route, Routes } from "react-router-dom";
import Header from "./component/Header/Header";
import Home from "./pages/Home"; // Import the separate HomeWithWk component
import History from "./component/History/History"; // Add this import
import FantasyProsWidget from "./component/FantasyPros/FantasyProsWidget";
import Footer from "./component/Footer/Footer";
import HowItWork from "./pages/HowItWork";
import FAQS from "./component/FAQ/FAQS";
import About from "./pages/About";
import Auction from "./pages/Auction";
import ThisYear from "./component/History/ThisYear"
import TopTargetsDashboard from './pages/TopTargetsDashboard';
import CompactTopTargetsDashboard from './pages/CompactTopTargetsDashboard'
import WeeklyBids from './pages/WeeklyBids';
import EmbedWeek from './pages/EmbedWeek';
import { fetchCurrentWeek } from './api/faabApi';
import { initGA, logPageView } from './analytics';
import { useLocation, useParams } from 'react-router-dom'; 

/**
 * Resolves the live season and week from the API instead of a hardcoded
 * constant, so the page cannot drift out of sync with the NFL calendar.
 */
function CurrentWeekBids() {
  const [wk, setWk] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetchCurrentWeek().then(setWk).catch(() => setFailed(true));
  }, []);

  if (failed) return <div style={{ padding: 40, textAlign: 'center' }}>Could not load the current week.</div>;
  if (!wk) return <div style={{ padding: 40, textAlign: 'center' }}>Loading…</div>;
  return <WeeklyBids season={wk.season} week={wk.week} />;
}

function BidsForWeek() {
  const { season, wk } = useParams();
  return <WeeklyBids season={season ? Number(season) : undefined} week={Number(wk)} />;
}

function App() {
  useEffect(() => {
    initGA();
    logPageView();
  }, []);

  const [curWk, setCurWk] = useState(54);

const location = useLocation();
const hideHeaderFooterRoutes = ['/', '/toptargets', '/compact-dashboard', '/embed'];
// The redesigned bid page brings its own header and week strip. Matched by
// prefix because it has sub-routes like /bids/2026/3.
const hideChromePrefixes = ['/bids'];
const hideChrome =
  hideHeaderFooterRoutes.includes(location.pathname) ||
  hideChromePrefixes.some((p) => location.pathname === p || location.pathname.startsWith(p + '/'));



return (
  <div className="">
    {/* Only show Header if NOT on toptargets page */}
    {!hideChrome && <Header currentWk={curWk} />}
    
    <Routes>
      {/* The redesigned bid page is the front door. */}
      <Route exact path="/" element={<CurrentWeekBids />} />
      {/* The previous home page, kept reachable rather than deleted. */}
      <Route path="/classic" element={<Home curWk={curWk} />} />
      <Route path="/toptargets" element={<TopTargetsDashboard week={curWk} />} />  
      <Route path="/compact-dashboard" element={<CompactTopTargetsDashboard week={curWk} />} />
      <Route path="/auction" element={<Auction />} />
      <Route path="/demo" element={<Home curWk={30} />} />
      <Route path="/history" element={<History />} />
      <Route path="/thisyear" element={<ThisYear />} />
      <Route path="/history/:wk" element={<Home curWk={curWk} />} />
      <Route path="/rankings" element={<FantasyProsWidget />} />
      <Route path="/howitwork" element={<HowItWork />} />
      <Route path="/about" element={<About />} />
      <Route path="/faq" element={<FAQS />} />
      {/* Redesigned weekly bid page. */}
      {/* Bare, read-only table for embedding in an article. */}
      <Route path="/embed" element={<EmbedWeek />} />
      <Route path="/bids" element={<CurrentWeekBids />} />
      <Route path="/bids/:wk" element={<BidsForWeek />} />
      <Route path="/bids/:season/:wk" element={<BidsForWeek />} />
    </Routes>
    
    {/* You might also want to hide Footer on toptargets */}
  {!hideChrome && <Footer />}
  </div>
);
}

export default App;
