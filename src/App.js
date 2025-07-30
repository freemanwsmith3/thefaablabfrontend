import React, { useState, useEffect } from 'react';
import { Route, Routes } from "react-router-dom";
import Header from "./component/Header/Header";
import Home from "./pages/Home"; // Import the separate HomeWithWk component
import FantasyProsWidget from "./component/FantasyPros/FantasyProsWidget";
import Footer from "./component/Footer/Footer";
import HowItWork from "./pages/HowItWork";
import FAQS from "./component/FAQ/FAQS";
import About from "./pages/About";
import Auction from "./pages/Auction";
import { initGA, logPageView } from './analytics';

function App() {
  useEffect(() => {
    initGA();
    logPageView();
  }, []);

  const [curWk, setCurWk] = useState(41);

  return (
    <div className="">
      <Header currentWk={curWk} />
      <Routes>
        <Route exact path="/" element={<Home curWk={curWk} />} />
        <Route path="/auction" element={<Auction />} />
        <Route path="/history/:wk" element={<Home curWk={curWk} />} />
        <Route path="/rankings" element={<FantasyProsWidget />} />
        <Route path="/howitwork" element={<HowItWork />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQS />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;