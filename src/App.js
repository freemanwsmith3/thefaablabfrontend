import Header from "./component/Header/Header";
import React, { useState, useEffect } from 'react';
import moment from 'moment-timezone';
import { Route, Routes, useParams, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Footer from "./component/Footer/Footer";
import HowItWork from "./pages/HowItWork";
import FAQS from "./component/FAQ/FAQS";
import WeeklyBids from "./pages/WeeklyBids";
import { fetchCurrentWeek } from "./api/faabApi";

/**
 * Resolves the live season/week from the API rather than a hardcoded season
 * start. The previous logic pinned to 2024 dates and showed "Week 0" for every
 * visitor once that window passed.
 */
/**
 * The redesigned bid page ships its own header and week strip, so the original
 * site header must not also render above it. Every other route still gets it.
 */
const LegacyHeader = ({ currentWk }) => {
  const { pathname } = useLocation();
  if (pathname === "/bids" || pathname.startsWith("/bids/")) return null;
  return <Header currentWk={currentWk} />;
};

const CurrentWeekBids = () => {
  const [wk, setWk] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    fetchCurrentWeek().then(setWk).catch(() => setFailed(true));
  }, []);
  if (failed) return <div style={{ padding: 40, textAlign: "center" }}>Could not load the current week.</div>;
  if (!wk) return <div style={{ padding: 40, textAlign: "center" }}>Loading…</div>;
  return <WeeklyBids season={wk.season} week={wk.week} />;
};

function App() {
  // here is where i am setting default week (28) = 1
  const startWeek = 27
  const [autoWk, setAutoWk] = useState(startWeek);
  useEffect(() => {
    let timerId;
  
    // Function to calculate autoWk based on the current date
    const calculateAutoWk = () => {
      const startDate = moment.tz('2024-09-10 05:00', 'America/New_York');
      const endDate = moment.tz('2024-12-10 05:00', 'America/New_York');
      const now = moment.tz('America/New_York');
  
      if (now.isBefore(startDate)) {
        setAutoWk(startWeek);
      } else if (now.isAfter(endDate)) {
        // Stop updating after endDate
        if (timerId) {
          clearInterval(timerId);
          timerId = null;
        }
      } else {
        const weeksPassed = now.diff(startDate, 'weeks');
        setAutoWk(startWeek + weeksPassed);
      }
    };
  
    // Calculate initial value of autoWk
    calculateAutoWk();
  
    // Only set up interval if we haven't passed the end date
    const endDate = moment.tz('2024-12-10 05:00', 'America/New_York');
    const now = moment.tz('America/New_York');
    
    if (now.isBefore(endDate)) {
      // Set up interval to update autoWk every Tuesday at 5 am Eastern Time
      timerId = setInterval(() => {
        const now = moment.tz('America/New_York');
        if (now.day() === 2 && now.hour() === 5) {
          calculateAutoWk();
        }
      }, 3600000); // Check every hour
    }
  
    // Cleanup interval on component unmount
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, []);
  
  return (
    <div className="">
      <LegacyHeader currentWk={autoWk} />
      <Routes>
        <Route exact path="/" element={<Home defaultWk={autoWk} />} />
        <Route path="/history/:wk" element={<HomeWithWk />} />
        <Route path="/howitwork" element={<HowItWork />} />
        <Route path="/faq" element={<FAQS />} />
        {/* Redesigned weekly bid page. */}
        <Route path="/bids" element={<CurrentWeekBids />} />
        <Route path="/bids/:wk" element={<BidsWithWk />} />
        <Route path="/bids/:season/:wk" element={<BidsWithWk />} />
      </Routes>
      <Footer />
    </div>
  );
}

const BidsWithWk = () => {
  const { wk, season } = useParams();
  return <WeeklyBids season={season ? Number(season) : undefined} week={Number(wk)} />;
};

const HomeWithWk = () => {
  const { wk } = useParams();
  return <Home wk={wk} />;
};

export default App;
