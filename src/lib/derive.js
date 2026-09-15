/**
 * Values derived from the crowd distribution. All inputs and outputs are
 * percent; the components convert to dollars at render time.
 */
import { color } from '../design/tokens';

/**
 * Index of the "winning" bucket.
 *
 * The modal bid value decides it, per the design. If that lands in the lowest
 * bucket the next one up is used instead -- a "$1–$8 winning range" is not
 * useful advice. Falls back to the largest bucket when mode is null, which the
 * API returns for multimodal data.
 */
export function winningBucketIndex(buckets, mode) {
  if (!buckets.length) return -1;
  let idx = -1;
  if (mode != null) {
    idx = buckets.findIndex((b, i) =>
      i === buckets.length - 1 ? mode >= b.loPct && mode <= b.hiPct : mode >= b.loPct && mode < b.hiPct
    );
  }
  if (idx < 0) {
    const most = Math.max(...buckets.map((b) => b.bids));
    idx = buckets.findIndex((b) => b.bids === most);
  }
  if (idx === 0 && buckets.length > 1) idx = 1;
  return idx;
}

/** Bar colour: below the winning bucket is Budget, above it is Safe. */
export function bucketColor(index, winningIndex) {
  if (index === winningIndex) return color.winning;
  return index < winningIndex ? color.budget : color.safe;
}

/** Bar fill width, as a percentage of the widest bucket. */
export function barWidth(bids, buckets) {
  const most = Math.max(1, ...buckets.map((b) => b.bids));
  return Math.round((bids / most) * 100);
}

/** Share of all (post-trim) bids in this bucket. */
export function bucketShare(bids, total) {
  if (!total) return 0;
  return Math.round((bids / total) * 100);
}

/** Where the slider starts: the community median, or a modest default. */
export function initialBid(player) {
  if (player.median != null) return Math.round(player.median);
  return 5;
}
