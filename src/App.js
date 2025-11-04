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
import { initGA, logPageView } from './analytics';
import { useLocation } from 'react-router-dom'; 

function App() {
  useEffect(() => {
    initGA();
    logPageView();
  }, []);

  const [curWk, setCurWk] = useState(49);

const location = useLocation();
const hideHeaderFooterRoutes = ['/toptargets', '/compact-dashboard'];



return (
  <div className="">
    {/* Only show Header if NOT on toptargets page */}
    {!hideHeaderFooterRoutes.includes(location.pathname) && <Header currentWk={curWk} />}
    
    <Routes>
      <Route exact path="/" element={<Home curWk={curWk} />} />
      <Route exact path="/" element={<Auction />} />
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
    </Routes>
    
    {/* You might also want to hide Footer on toptargets */}
  {!hideHeaderFooterRoutes.includes(location.pathname) && <Footer />}
  </div>
);
}

export default App;
