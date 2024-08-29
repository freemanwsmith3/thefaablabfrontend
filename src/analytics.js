import ReactGA from 'react-ga';

export const initGA = () => {
  ReactGA.initialize('G-T7FEVCTMQS'); // Your Google Analytics Property ID
};

export const logPageView = () => {
    console.log('Logging pageview for', window.location.pathname);
    ReactGA.set({ page: window.location.pathname });
    ReactGA.pageview(window.location.pathname);
};
