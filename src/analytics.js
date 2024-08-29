import ReactGA from 'react-ga4';

export const initGA = () => {
  ReactGA.initialize('G-T7FEVCTMQS'); // Replace with your GA4 Measurement ID
};

export const logPageView = () => {
  ReactGA.send({ hitType: "pageview", page: window.location.pathname });
};
