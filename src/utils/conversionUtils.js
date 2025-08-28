// Conversion factors for auction values
export const CONVERSION_FACTORS = {
  // Team count multipliers (to convert TO 12-team baseline)
  teamCount: {
    8: 0.75,   // 8-team values are higher, so reduce to get 12-team
    10: 0.85,  // 10-team values are higher
    12: 1.00,  // Baseline
    14: 1.15,  // 14-team values are lower, so increase
    16: 1.25   // 16-team values are lower
  },

  // Scoring system multipliers by position (to convert TO half-PPR baseline)
  scoring: {
    'standard': {
      QB: 1.00,
      RB: 1.15,  // RBs more valuable in standard
      WR: 0.85,  // WRs less valuable in standard  
      TE: 0.90,  // TEs less valuable in standard
      K: 1.00,
      DST: 1.00
    },
    'half-ppr': {
      QB: 1.00,
      RB: 1.00,  // Baseline
      WR: 1.00,  // Baseline
      TE: 1.00,  // Baseline
      K: 1.00,
      DST: 1.00
    },
    'full-ppr': {
      QB: 1.00,
      RB: 0.88,  // RBs less valuable in full PPR
      WR: 1.12,  // WRs more valuable in full PPR
      TE: 1.08,  // TEs more valuable in full PPR
      K: 1.00,
      DST: 1.00
    }
  },

  // Superflex adjustments (when converting TO standard baseline)
  superflex: {
    QB: 2.85,  // QBs much MORE valuable in superflex leagues
    other: 0.87 // Less budget available for other positions
  },

  // Dynasty adjustments (when converting TO redraft baseline)
  // These would need player age data to implement fully
  dynasty: {
    young: 1.30,  // Ages 22-24
    prime: 1.10,  // Ages 25-27  
    aging: 0.80,  // Ages 28-30
    old: 0.60     // Ages 31+
  }
};

/**
 * Convert a bid from user's league format to the baseline format (12-team, half-PPR, $200, standard, redraft)
 */
export const convertToBaseline = (bid, userSettings, position = 'RB') => {
  if (!bid || bid === 0) return bid;
  
  let convertedBid = bid;
  
  // Team count adjustment
  const teamMultiplier = CONVERSION_FACTORS.teamCount[userSettings.teamCount] || 1.0;
  convertedBid = convertedBid / teamMultiplier; // Invert because we're going TO baseline
  
  // Scoring adjustment  
  const scoringMultiplier = CONVERSION_FACTORS.scoring[userSettings.scoring]?.[position] || 1.0;
  convertedBid = convertedBid / scoringMultiplier; // Invert because we're going TO baseline
  
  // Budget adjustment
  const budgetMultiplier = 200 / userSettings.budget; // Scale to $200 baseline
  convertedBid = convertedBid * budgetMultiplier;
  
  // Superflex adjustment (if user has superflex, convert TO standard)
  if (userSettings.isSuperflex) {
    if (position === 'QB') {
      convertedBid = convertedBid / CONVERSION_FACTORS.superflex.QB; // Make QB more valuable in baseline
    } else {
      convertedBid = convertedBid / CONVERSION_FACTORS.superflex.other; // Less budget for others
    }
  }
  
  return Math.round(convertedBid);
};

/**
 * Convert a bid from baseline format to user's league format  
 */
export const convertFromBaseline = (baselineBid, userSettings, position = 'RB') => {
  if (!baselineBid || baselineBid === 0) return baselineBid;
  
  let convertedBid = baselineBid;
  
  // Team count adjustment
  const teamMultiplier = CONVERSION_FACTORS.teamCount[userSettings.teamCount] || 1.0;
  convertedBid = convertedBid * teamMultiplier;
  
  // Scoring adjustment
  const scoringMultiplier = CONVERSION_FACTORS.scoring[userSettings.scoring]?.[position] || 1.0;
  convertedBid = convertedBid * scoringMultiplier;
  
  // Budget adjustment  
  const budgetMultiplier = userSettings.budget / 200; // Scale from $200 baseline
  convertedBid = convertedBid * budgetMultiplier;
  
  // Superflex adjustment (if user has superflex, convert FROM standard)
  if (userSettings.isSuperflex) {
    if (position === 'QB') {
      convertedBid = convertedBid * CONVERSION_FACTORS.superflex.QB; // Make QB less valuable
    } else {
      convertedBid = convertedBid * CONVERSION_FACTORS.superflex.other; // More budget for others
    }
  }
  
  return Math.round(convertedBid);
};

/**
 * Convert bid range data for display in user's format
 */
export const convertBidRangeData = (graphData, userSettings, position = 'RB') => {
  if (!graphData || !Array.isArray(graphData)) return graphData;
  
  return graphData.map(item => {
    const [min, max] = item.label.split(' - ').map(num => parseInt(num.trim()));
    
    const convertedMin = convertFromBaseline(min, userSettings, position);
    const convertedMax = convertFromBaseline(max, userSettings, position);
    
    return {
      ...item,
      label: `${convertedMin} - ${convertedMax}`,
      originalLabel: item.label, // Keep original for reference
      convertedMin,
      convertedMax
    };
  });
};

/**
 * Get the display format for bids based on user settings
 */
export const getBidDisplayFormat = (userSettings) => {
  return `$${userSettings.budget} Budget | ${userSettings.teamCount} Team | ${
    userSettings.scoring === 'standard' ? 'Standard' :
    userSettings.scoring === 'half-ppr' ? 'Half PPR' : 'Full PPR'
  }${userSettings.isSuperflex ? ' | Superflex' : ''}`;
};

/**
 * Get placeholder text for bid input
 */
export const getBidPlaceholder = (userSettings) => {
  return `Your bid out of $${userSettings.budget}`;
};