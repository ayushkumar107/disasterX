import React, { useState, useEffect } from 'react';

export const UTCClock = () => {
  const [time, setTime] = useState(new Date());
  const [showUtc, setShowUtc] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Format user's local time accurately
  const localTimeString = time.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const localDateString = time.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Timezone abbreviation (e.g. IST, EST, PST)
  const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const shortTz = tzName.split('/')[1]?.replace('_', ' ') || tzName;

  const utc = time.toISOString().slice(11, 19);

  return (
    <div 
      className="flex items-center gap-2 cursor-pointer select-none"
      onClick={() => setShowUtc(!showUtc)}
      title="Click to toggle Local / UTC Time"
    >
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-dx-green)] animate-blink" />
        <span className="telemetry-label font-mono font-semibold text-[var(--color-dx-cyan)]">
          {showUtc ? 'UTC' : 'LOCAL'}
        </span>
      </div>

      <span className="font-mono text-xs font-semibold text-[var(--color-dx-cyan)] tracking-wider">
        {showUtc ? utc : localTimeString}
      </span>

      <span className="font-mono text-[10px] text-[var(--color-dx-muted)] hidden sm:inline">
        {showUtc ? 'UTC' : shortTz}
      </span>

      <span className="font-mono text-[10px] text-[var(--color-dx-muted)]">
        ({localDateString})
      </span>
    </div>
  );
};
