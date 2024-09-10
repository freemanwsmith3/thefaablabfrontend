import React, { useState, useEffect } from 'react';
import moment from 'moment-timezone';
import { Route, Routes, useParams, useLocation } from "react-router-dom";
import Header from "./component/Header/Header";
import Home from "./pages/Home";
import FantasyProsWidget from "./component/FantasyPros/FantasyProsWidget";
import Footer from "./component/Footer/Footer";
import HowItWork from "./pages/HowItWork";
import FAQS from "./component/FAQ/FAQS";
import About from "./pages/About";
import Auction from "./pages/Auction";
import { initGA, logPageView } from './analytics'; // Updated import

function App() {
  const startWeek = 27;
  const [autoWk, setAutoWk] = useState(startWeek);
  const location = useLocation();

  useEffect(() => {
    initGA(); // Initialize Google Analytics with GA4 ID
    logPageView(); // Log the first page view
  }, []);

  useEffect(() => {
    logPageView(); // Log page view on route change
  }, [location]);

  useEffect(() => {
    const calculateAutoWk = () => {
      const startDate = moment.tz('2024-09-10 05:00', 'America/New_York');
      const endDate = moment.tz('2024-12-10 05:00', 'America/New_York');
      const now = moment.tz('America/New_York');

      if (now.isBefore(startDate)) {
        setAutoWk(startWeek);
      } else if (now.isAfter(endDate)) {
        clearInterval(timerId);
      } else {
        const weeksPassed = now.diff(startDate, 'weeks');
        setAutoWk(startWeek + weeksPassed);
      }
    };

    calculateAutoWk();

    const timerId = setInterval(() => {
      const now = moment.tz('America/New_York');
      if (now.day() === 2 && now.hour() === 5) {
        calculateAutoWk();
      }
    }, 3600000);

    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="">
      <Header currentWk={autoWk} />
      <Routes>
        <Route exact path="/" element={<HomeWithWk />} />
        <Route path="/auction" element={<Auction />} />
        <Route path="/history/:wk" element={<HomeWithWk />} />
        <Route path="/rankings" element={<FantasyProsWidget />} />
        <Route path="/howitwork" element={<HowItWork />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQS />} />
      </Routes>
      <Footer />
    </div>
  );
}

const HomeWithWk = () => {
  const { wk } = useParams();
  return <Home wk={wk} />;
};

export default App;
