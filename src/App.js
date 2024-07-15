import Header from "./component/Header/Header";
import React, { useState, useEffect } from 'react';
import moment from 'moment-timezone';
import { Route, Routes, useParams } from "react-router-dom";
import Home from "./pages/Home";
import FantasyProsWidget from "./component/FantasyPros/FantasyProsWidget";
import Footer from "./component/Footer/Footer";
import HowItWork from "./pages/HowItWork";
import FAQS from "./component/FAQ/FAQS";

function App() {
  // here is where i am setting default week (28) = 1
  const startWeek = 27
  const [autoWk, setAutoWk] = useState(startWeek);
  useEffect(() => {
    // Function to calculate autoWk based on the current date
    const calculateAutoWk = () => {
      const startDate = moment.tz('2024-09-10 05:00', 'America/New_York');
      const endDate = moment.tz('2024-12-10 05:00', 'America/New_York');
      const now = moment.tz('America/New_York');

      if (now.isBefore(startDate)) {
        setAutoWk(startWeek);
      } else if (now.isAfter(endDate)) {
        // Stop updating after endDate
        clearInterval(timerId);
      } else {
        const weeksPassed = now.diff(startDate, 'weeks');
        setAutoWk(startWeek + weeksPassed);
      }
    };

    // Calculate initial value of autoWk
    calculateAutoWk();

    // Set up interval to update autoWk every Tuesday at 5 am Eastern Time
    const timerId = setInterval(() => {
      const now = moment.tz('America/New_York');
      if (now.day() === 2 && now.hour() === 5) {
        calculateAutoWk();
      }
    }, 3600000); // Check every hour

    // Cleanup interval on component unmount
    return () => clearInterval(timerId);
  }, []);
  
  return (
    <div className="">
      <Header currentWk={autoWk} />
      <Routes>
        <Route exact path="/" element={<Home defaultWk={autoWk} />} />
        <Route path="/history/:wk" element={<HomeWithWk />} />
        <Route path="/rankings" element={<FantasyProsWidget />} />
        <Route path="/howitwork" element={<HowItWork />} />
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
