import ReactGA from 'react-ga4';

export const initGA = () => {
  ReactGA.initialize('G-T7FEVCTMQS'); // Replace with your GA4 Measurement ID
};

export const logPageView = () => {
  console.log('Logging pageview for', window.location.pathname); // For debugging
  ReactGA.send({ hitType: "pageview", page: window.location.pathname });
};
