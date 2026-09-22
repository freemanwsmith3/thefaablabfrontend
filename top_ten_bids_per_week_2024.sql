WITH agg AS (
  SELECT
    ab.week                   AS iso_week,
    ab.player_id,
    p.name AS player_name,
    COUNT(*) AS bid_count,
    AVG(ab.value)::numeric(10,2) AS avg_bid
  FROM public.api_bid ab
  JOIN public.api_player p ON p.id = ab.player_id
  WHERE ab.week BETWEEN 29 AND 40
    -- AND ab.season = 2025        -- keep if you track season/year
  GROUP BY ab.week, ab.player_id, p.name
),
ranked AS (
  SELECT
    *,
    ROW_NUMBER() OVER (
      PARTITION BY iso_week
      ORDER BY bid_count DESC, avg_bid DESC, player_name
    ) AS rn
  FROM agg
)
SELECT
  iso_week,
  player_id,
  player_name,
  bid_count,
  avg_bid
FROM ranked
WHERE rn <= 5
ORDER BY  iso_week, bid_count DESC, avg_bid DESC, player_name;
