import './setup.mjs';
import {
  TOTAL_SEAT_CAPACITY,
  generateAllSeatNumbers,
  getSeatStats,
} from '../src/utils/seatLayout.js';

describe('seatLayout', () => {
  it('generates 150 seats for the library grid', () => {
    const seats = generateAllSeatNumbers();
    expect(seats).toHaveLength(TOTAL_SEAT_CAPACITY);
    expect(seats[0]).toBe('A1');
    expect(seats).toContain('G25');
  });

  it('reports available seats from total capacity', async () => {
    const stats = await getSeatStats();
    expect(stats.totalSeats).toBe(TOTAL_SEAT_CAPACITY);
    expect(stats.availableSeats).toBe(stats.totalSeats - stats.occupiedSeats);
    expect(stats.availableSeats).toBeGreaterThanOrEqual(0);
  });
});
