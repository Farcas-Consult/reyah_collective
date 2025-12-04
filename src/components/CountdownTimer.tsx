'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endDate: string;
  size?: 'sm' | 'md' | 'lg';
  onExpire?: () => void;
  showLabel?: boolean;
  className?: string;
}

export default function CountdownTimer({
  endDate,
  size = 'md',
  onExpire,
  showLabel = true,
  className = '',
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const end = new Date(endDate).getTime();
      const now = new Date().getTime();
      const total = Math.max(end - now, 0);

      if (total === 0 && onExpire) {
        onExpire();
      }

      const days = Math.floor(total / (1000 * 60 * 60 * 24));
      const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((total % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds, total });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [endDate, onExpire]);

  if (timeRemaining.total === 0) {
    return (
      <div className={`text-red-600 font-bold ${className}`}>
        ⏰ Sale Ended
      </div>
    );
  }

  const isExpiringSoon = timeRemaining.total < 60 * 60 * 1000; // Less than 1 hour
  const isLastMinute = timeRemaining.total < 5 * 60 * 1000; // Less than 5 minutes

  const sizeClasses = {
    sm: {
      container: 'text-xs',
      number: 'text-sm font-bold',
      unit: 'text-[10px]',
      separator: 'text-xs',
    },
    md: {
      container: 'text-sm',
      number: 'text-lg font-bold',
      unit: 'text-xs',
      separator: 'text-sm',
    },
    lg: {
      container: 'text-base',
      number: 'text-2xl md:text-3xl font-bold',
      unit: 'text-sm',
      separator: 'text-xl',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={className}>
      {showLabel && (
        <div className={`mb-2 font-semibold ${sizes.container} ${isExpiringSoon ? 'text-red-600' : 'text-[var(--brown-800)]'}`}>
          {isLastMinute ? '⚡ ENDING VERY SOON!' : isExpiringSoon ? '⏰ Ending Soon!' : '⏳ Ends In:'}
        </div>
      )}
      
      <div className="flex items-center gap-1 md:gap-2">
        {timeRemaining.days > 0 && (
          <>
            <div className="flex flex-col items-center bg-white rounded-md px-2 py-1 border border-[var(--beige-300)] shadow-sm">
              <span className={`${sizes.number} ${isExpiringSoon ? 'text-red-600' : 'text-[var(--accent)]'}`}>
                {String(timeRemaining.days).padStart(2, '0')}
              </span>
              <span className={`${sizes.unit} text-gray-500 uppercase`}>Days</span>
            </div>
            <span className={`${sizes.separator} font-bold text-gray-400`}>:</span>
          </>
        )}
        
        <div className="flex flex-col items-center bg-white rounded-md px-2 py-1 border border-[var(--beige-300)] shadow-sm">
          <span className={`${sizes.number} ${isExpiringSoon ? 'text-red-600' : 'text-[var(--accent)]'}`}>
            {String(timeRemaining.hours).padStart(2, '0')}
          </span>
          <span className={`${sizes.unit} text-gray-500 uppercase`}>Hours</span>
        </div>
        
        <span className={`${sizes.separator} font-bold text-gray-400`}>:</span>
        
        <div className="flex flex-col items-center bg-white rounded-md px-2 py-1 border border-[var(--beige-300)] shadow-sm">
          <span className={`${sizes.number} ${isExpiringSoon ? 'text-red-600' : 'text-[var(--accent)]'}`}>
            {String(timeRemaining.minutes).padStart(2, '0')}
          </span>
          <span className={`${sizes.unit} text-gray-500 uppercase`}>Mins</span>
        </div>
        
        <span className={`${sizes.separator} font-bold text-gray-400`}>:</span>
        
        <div className="flex flex-col items-center bg-white rounded-md px-2 py-1 border border-[var(--beige-300)] shadow-sm">
          <span className={`${sizes.number} ${isExpiringSoon ? 'text-red-600 animate-pulse' : 'text-[var(--accent)]'}`}>
            {String(timeRemaining.seconds).padStart(2, '0')}
          </span>
          <span className={`${sizes.unit} text-gray-500 uppercase`}>Secs</span>
        </div>
      </div>

      {isExpiringSoon && (
        <div className="mt-2 text-xs text-red-600 font-semibold animate-pulse">
          🔥 Hurry! Limited time remaining!
        </div>
      )}
    </div>
  );
}
