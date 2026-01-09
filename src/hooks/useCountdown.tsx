import { useState, useEffect, useCallback } from "react";

interface CountdownResult {
  timeRemaining: string | null;
  isExpired: boolean;
}

export function useCountdown(endDate: string | undefined): CountdownResult {
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  const calculateTimeRemaining = useCallback(() => {
    if (!endDate) {
      return { text: null, expired: false };
    }

    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;

    if (diff <= 0) {
      return { text: null, expired: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let text = "";
    if (days > 0) {
      text = `${days}d ${hours}h`;
    } else if (hours > 0) {
      text = `${hours}h ${minutes}m`;
    } else {
      text = `${minutes}m`;
    }

    return { text, expired: false };
  }, [endDate]);

  useEffect(() => {
    if (!endDate) {
      setTimeRemaining(null);
      setIsExpired(false);
      return;
    }

    // Initial calculation
    const result = calculateTimeRemaining();
    setTimeRemaining(result.text);
    setIsExpired(result.expired);

    // Update every minute
    const interval = setInterval(() => {
      const result = calculateTimeRemaining();
      setTimeRemaining(result.text);
      setIsExpired(result.expired);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [endDate, calculateTimeRemaining]);

  return { timeRemaining, isExpired };
}