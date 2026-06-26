import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Clock, ExternalLink, Gift, X, Bell } from 'lucide-react';
import type { Announcement } from '../../data/landingContent';

type OfferBannerProps = {
  announcement: Announcement;
  onNavigate?: (sectionId: string) => void;
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(endDateStr: string): TimeLeft {
  if (!endDateStr) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const diff = Math.max(0, new Date(endDateStr).getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function isExpired(t: TimeLeft) {
  return t.days === 0 && t.hours === 0 && t.minutes === 0 && t.seconds === 0;
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="offer-countdown-unit">
      <div className="offer-countdown-box">
        <AnimatePresence mode="wait">
          <motion.span
            key={value}
            initial={{ y: -18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 18, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="offer-countdown-num"
          >
            {String(value).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="offer-countdown-label">{label}</span>
    </div>
  );
}

const CSS = `
  .offer-banner-section {
    padding: 3rem 1rem 4rem;
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
    position: relative;
    overflow: hidden;
  }
  .offer-banner-section::before {
    content: '';
    position: absolute;
    top: -60px; left: 50%;
    transform: translateX(-50%);
    width: 600px; height: 300px;
    background: radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%);
    pointer-events: none;
  }
  .offer-card {
    max-width: 860px;
    margin: 0 auto;
    background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(99,102,241,0.12) 100%);
    border: 1px solid rgba(99,102,241,0.35);
    border-radius: 1.5rem;
    padding: 2.5rem 2rem 2rem;
    position: relative;
    box-shadow: 0 0 40px rgba(99,102,241,0.15), 0 8px 32px rgba(0,0,0,0.4);
    backdrop-filter: blur(10px);
  }
  .offer-upcoming-card {
    max-width: 860px;
    margin: 0 auto;
    background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(251,191,36,0.08) 100%);
    border: 1px solid rgba(251,191,36,0.25);
    border-radius: 1.5rem;
    padding: 2rem 2rem 1.8rem;
    position: relative;
    box-shadow: 0 0 30px rgba(251,191,36,0.08), 0 8px 24px rgba(0,0,0,0.35);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: flex-start;
    gap: 1.2rem;
  }
  .offer-upcoming-icon {
    width: 48px; height: 48px;
    border-radius: 50%;
    background: rgba(251,191,36,0.15);
    border: 1px solid rgba(251,191,36,0.3);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    color: #fbbf24;
  }
  .offer-upcoming-title {
    font-size: 0.7rem; font-weight: 700;
    color: #fbbf24;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 0.4rem;
  }
  .offer-upcoming-text {
    font-size: 1rem; font-weight: 600;
    color: #e2e8f0;
    line-height: 1.5;
  }
  .offer-dismiss {
    position: absolute;
    top: 1rem; right: 1rem;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 50%;
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    color: rgba(255,255,255,0.55);
    transition: color 0.2s, background 0.2s;
  }
  .offer-dismiss:hover { color: #fff; background: rgba(99,102,241,0.3); }
  .offer-badge {
    display: inline-flex; align-items: center; gap: 0.35rem;
    background: rgba(99,102,241,0.25);
    border: 1px solid rgba(99,102,241,0.5);
    color: #a5b4fc;
    font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.28rem 0.9rem;
    border-radius: 999px;
    margin-bottom: 1rem;
  }
  .offer-title {
    font-size: clamp(1.4rem, 4vw, 2rem);
    font-weight: 800;
    color: #fff;
    line-height: 1.25;
    margin-bottom: 0.6rem;
  }
  .offer-title span {
    background: linear-gradient(90deg, #818cf8, #c084fc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .offer-text {
    color: #cbd5e1;
    font-size: 0.97rem;
    line-height: 1.6;
    max-width: 520px;
    margin-bottom: 1.8rem;
  }
  .offer-countdown-wrap {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 1.8rem;
  }
  .offer-countdown-label-main {
    display: flex; align-items: center; gap: 0.35rem;
    font-size: 0.78rem; font-weight: 600;
    color: #94a3b8;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-right: 0.5rem;
  }
  .offer-countdown-unit {
    display: flex; flex-direction: column; align-items: center; gap: 0.2rem;
  }
  .offer-countdown-box {
    background: rgba(15,23,42,0.7);
    border: 1px solid rgba(99,102,241,0.3);
    border-radius: 0.6rem;
    width: 52px; height: 52px;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
    position: relative;
  }
  .offer-countdown-num {
    font-size: 1.45rem;
    font-weight: 800;
    color: #a5b4fc;
    font-variant-numeric: tabular-nums;
    position: absolute;
  }
  .offer-countdown-label {
    font-size: 0.6rem;
    text-transform: uppercase;
    font-weight: 600;
    color: #64748b;
    letter-spacing: 0.05em;
  }
  .offer-sep {
    font-size: 1.4rem; font-weight: 800;
    color: rgba(99,102,241,0.5);
    align-self: flex-start;
    padding-top: 0.35rem;
  }
  .offer-cta {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #fff;
    font-size: 0.9rem; font-weight: 700;
    padding: 0.7rem 1.6rem;
    border-radius: 0.75rem;
    border: none; cursor: pointer;
    box-shadow: 0 4px 20px rgba(99,102,241,0.4);
    transition: transform 0.18s, box-shadow 0.18s;
  }
  .offer-cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(99,102,241,0.55);
  }
  .offer-glow-orb {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }
  @media (max-width: 480px) {
    .offer-card { padding: 2rem 1.1rem 1.5rem; }
    .offer-countdown-box { width: 44px; height: 44px; }
    .offer-countdown-num { font-size: 1.15rem; }
    .offer-upcoming-card { flex-direction: column; gap: 0.8rem; }
  }
`;

export default function OfferBanner({ announcement, onNavigate }: OfferBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft(announcement.endDate));

  useEffect(() => {
    setTimeLeft(getTimeLeft(announcement.endDate));
    const id = setInterval(() => setTimeLeft(getTimeLeft(announcement.endDate)), 1000);
    return () => clearInterval(id);
  }, [announcement.endDate]);

  if (!announcement.show || dismissed) return null;

  const expired = isExpired(timeLeft);
  const hasUpcomingText = (announcement.upcomingText ?? '').trim().length > 0;

  // If expired and no upcoming text, hide entirely
  if (expired && !hasUpcomingText) return null;

  const handleLink = () => {
    const link = announcement.link;
    if (!link) return;
    if (link.startsWith('#')) {
      const sectionId = link.replace('#', '');
      onNavigate?.(sectionId);
    } else {
      window.open(link, '_blank', 'noreferrer');
    }
  };

  return (
    <section className="offer-banner-section">
      <style>{CSS}</style>

      <AnimatePresence mode="wait">
        {expired ? (
          /* ── Upcoming Offer State ── */
          <motion.div
            key="upcoming"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="offer-upcoming-card"
          >
            <button
              type="button"
              className="offer-dismiss"
              aria-label="Dismiss"
              onClick={() => setDismissed(true)}
            >
              <X size={15} />
            </button>

            <div className="offer-upcoming-icon">
              <Bell size={22} />
            </div>
            <div>
              <p className="offer-upcoming-title">⏳ Upcoming Offer</p>
              <p className="offer-upcoming-text">{announcement.upcomingText}</p>
            </div>
          </motion.div>
        ) : (
          /* ── Active Offer State ── */
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            viewport={{ once: true, amount: 0.3 } as any}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="offer-card"
          >
            {/* Dismiss */}
            <button
              type="button"
              className="offer-dismiss"
              aria-label="Dismiss offer"
              onClick={() => setDismissed(true)}
            >
              <X size={15} />
            </button>

            {/* Decorative glowing orbs */}
            <div
              className="offer-glow-orb"
              style={{
                width: 180, height: 180,
                background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
                top: -60, right: 20,
              }}
            />
            <div
              className="offer-glow-orb"
              style={{
                width: 120, height: 120,
                background: 'radial-gradient(circle, rgba(192,132,252,0.12) 0%, transparent 70%)',
                bottom: -30, left: 40,
              }}
            />

            {/* Badge */}
            <div className="offer-badge">
              <Gift size={11} />
              {announcement.title || 'Limited Time Offer'}
            </div>

            {/* Title */}
            <h2 className="offer-title">
              Exclusive <span>Special Offer</span>
            </h2>

            {/* Text */}
            <p className="offer-text">{announcement.text}</p>

            {/* Countdown */}
            <div className="offer-countdown-wrap">
              <div className="offer-countdown-label-main">
                <Clock size={13} />
                Offer ends in
              </div>
              <CountdownUnit value={timeLeft.days} label="Days" />
              <span className="offer-sep">:</span>
              <CountdownUnit value={timeLeft.hours} label="Hrs" />
              <span className="offer-sep">:</span>
              <CountdownUnit value={timeLeft.minutes} label="Min" />
              <span className="offer-sep">:</span>
              <CountdownUnit value={timeLeft.seconds} label="Sec" />
            </div>

            {/* CTA */}
            {announcement.link && (
              <motion.button
                type="button"
                className="offer-cta"
                onClick={handleLink}
                whileTap={{ scale: 0.97 }}
              >
                <Sparkles size={16} />
                Grab This Offer
                <ExternalLink size={14} />
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
