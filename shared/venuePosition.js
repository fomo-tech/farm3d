import { VENUE_LAYOUT } from './venueLayout.js';

// Venue identity and coordinates must describe the same space, including
// legacy saves that kept a venue name with an outdoor/default position.
export function normalizeVenuePosition(position) {
  if (!position) return position;
  const venue = VENUE_LAYOUT[position.venue];
  if (!venue) return position.venue ? { ...position, venue: null } : position;
  const room = venue.interior;
  if (Number.isFinite(position.y) && Math.abs(position.y - room.y) < 4
    && Math.hypot(position.x - room.x, position.z - room.z) <= 22) return position;
  return { ...position, x: room.x, y: room.y, z: room.z - 5.5 };
}
