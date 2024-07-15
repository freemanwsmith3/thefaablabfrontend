import React, { useEffect } from 'react';
import './FantasyProsWidget.css'; // Import the CSS file for widget styles

const FantasyProsWidget = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.fantasypros.com/js/fp-widget-2.0.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="fp-widget-container">
      <div
        id="fp-widget"
        data-height="100%"
        data-width="100%"
        data-thead_color="#ffffff"
        data-thead_font="#000000"
        data-t_alt_row="#fafafa"
        data-link_color="#3778be"
        data-pill_color="#035E7B"
        data-sport="NFL"
        data-wtype="preseason"
        data-filters=""
        data-scoring="HALF"
        data-expert="6564"
        data-affiliate_code=""
        data-year="2024"
        data-week="0"
        data-auction="false"
        data-Notes="false"
        data-tags="false"
        data-cards="true"
        data-showPodcastIcons="false"
        data-format="table"
        data-promo_link="true"
        data-title_header="false"
        data-positions="ALL:QB:RB:WR:TE:OP"
        data-ppr_positions="ALL:RB:WR:TE:OP"
        data-half_positions="ALL:RB:WR:TE:OP"
        data-site=""
        data-fd_aff=""
        data-dk_aff=""
        data-fa_aff=""
        data-dp_aff=""
      ></div>
      <div className="fpw-footer">
        <span style={{ float: 'left' }}>
          <a
            href="https://www.fantasypros.com/nfl/rankings/consensus-cheatsheets.php"
            target="_blank"
            rel="nofollow"
          >
            2024 Fantasy Football Rankings
          </a>{' '}
          powered by FantasyPros
        </span>
        <span style={{ float: 'right', textAlign: 'right' }}>
          ECR ™ -{' '}
          <a
            href="https://www.fantasypros.com/about/faq/tools/#consensus"
            target="_blank"
            rel="nofollow"
          >
            Expert Consensus Rankings
          </a>
          <br />
          ADP -{' '}
          <a
            href="https://www.fantasypros.com/nfl/adp/"
            target="_blank"
            rel="nofollow"
          >
            Average Draft Position
          </a>
        </span>
      </div>
    </div>
  );
};

export default FantasyProsWidget;
