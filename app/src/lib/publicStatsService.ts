import axios from 'axios';
import { apiUrl } from './apiConfig';

export type PublicStats = {
  visitorCount: number;
  totalAdmissions: number;
  activeStudents: number;
  totalStudents?: number;
  admissionBaseOffset?: number;
  availableSeats: number;
  occupiedSeats: number;
  totalSeats: number;
};

const VISIT_SESSION_KEY = 'demo_library_visit_recorded';

const statsUrl = () => apiUrl('/api/public/stats');
const visitUrl = () => apiUrl('/api/public/stats/visit');

export async function fetchPublicStats(): Promise<PublicStats> {
  const response = await axios.get(statsUrl(), {
    timeout: 10000,
    params: { _t: Date.now() },
  });
  return response.data;
}

export async function recordPublicVisitOnce(): Promise<PublicStats | null> {
  if (typeof window === 'undefined') return null;
  if (sessionStorage.getItem(VISIT_SESSION_KEY)) return null;

  try {
    const response = await axios.post(visitUrl(), {}, { timeout: 10000 });
    sessionStorage.setItem(VISIT_SESSION_KEY, '1');
    return response.data;
  } catch (error) {
    console.warn('Could not record visit:', error);
    return null;
  }
}

export async function loadPublicStatsForLanding(): Promise<PublicStats> {
  try {
    const afterVisit = await recordPublicVisitOnce();
    if (afterVisit) return afterVisit;
    return await fetchPublicStats();
  } catch (error) {
    console.warn('Public stats unavailable:', error);
    return {
      visitorCount: 530,
      totalAdmissions: 300,
      activeStudents: 0,
      availableSeats: 0,
      occupiedSeats: 0,
      totalSeats: 0,
    };
  }
}
