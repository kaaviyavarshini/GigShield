import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RichClaim } from './types';

interface RingAlertProps {
  claims: RichClaim[];
}

export function RingAlert({ claims }: RingAlertProps) {
  const [alert, setAlert] = useState<{ city: string; count: number; seconds: number } | null>(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const now = Date.now();
    const twoMinAgo = now - 2 * 60 * 1000;
    const cityCounts: Record<string, number> = {};

    claims.forEach(c => {
      const t = new Date(c.triggered_at).getTime();
      if (t > twoMinAgo) {
        cityCounts[c.zone] = (cityCounts[c.zone] || 0) + 1;
      }
    });

    const alertCity = Object.entries(cityCounts).find(([, count]) => count >= 5);
    if (alertCity) {
      setAlert({ city: alertCity[0], count: alertCity[1], seconds: 90 });
    } else {
      setAlert(null);
    }
  }, [claims]);

  useEffect(() => {
    if (!alert) return;
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [alert]);

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <AnimatePresence mode="wait">
      {!alert ? (
        <motion.div
          key="safe"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-4"
        >
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-[#16A34A] flex items-center justify-center shrink-0">
              <span className="text-white text-[14px]">✓</span>
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-[#16A34A]">No coordinated activity detected</h4>
              <p className="text-[11px] text-[#15803D] mt-0.5">All claim patterns within normal range</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="alert"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#FEF2F2] border-2 border-[#FECACA] rounded-2xl p-4 shadow-lg shadow-red-100"
        >
          <div className="flex items-start gap-3">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-8 w-8 rounded-full bg-[#DC2626] flex items-center justify-center shrink-0"
            >
              <span className="text-white text-[14px]">⚠️</span>
            </motion.div>
            <div className="flex-1">
              <h4 className="text-[13px] font-bold text-[#DC2626]">CLUSTER ALERT</h4>
              <p className="text-[11px] text-[#991B1B] mt-0.5">
                {alert.city} · <span className="font-bold">{alert.count} claims in 90 seconds</span>
              </p>
              <p className="text-[10px] text-[#B91C1C] mt-1">Auto-payouts paused for this zone</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-[#991B1B]">Investigating:</span>
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="font-mono-data text-[12px] font-bold text-[#DC2626]"
                >
                  {formatTimer(timer)}
                </motion.span>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="flex-1 px-3 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-[11px] font-bold rounded-lg transition-colors">
                  Release Claims
                </button>
                <button className="flex-1 px-3 py-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[11px] font-bold rounded-lg transition-colors">
                  Reject Batch
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
