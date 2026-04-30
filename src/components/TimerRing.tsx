import { useEffect, useMemo, useState } from "react";

type TimerRingProps = {
  durationSeconds: number;
  resetKey: string;
  isActive?: boolean;
  label?: string;
  onComplete?: () => void;
};

export function TimerRing({
  durationSeconds,
  resetKey,
  isActive = true,
  label = "Timer",
  onComplete,
}: TimerRingProps) {
  return (
    <TimerRingInner
      key={`${resetKey}-${durationSeconds}`}
      durationSeconds={durationSeconds}
      isActive={isActive}
      label={label}
      onComplete={onComplete}
    />
  );
}

function TimerRingInner({
  durationSeconds,
  isActive,
  label,
  onComplete,
}: Omit<TimerRingProps, "resetKey">) {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);

  useEffect(() => {
    if (!isActive) return;
    if (secondsLeft <= 0) {
      onComplete?.();
      return;
    }

    const tick = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => window.clearInterval(tick);
  }, [isActive, onComplete, secondsLeft]);

  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const progress = useMemo(
    () => Math.max(0, Math.min(1, secondsLeft / durationSeconds)),
    [durationSeconds, secondsLeft],
  );

  return (
    <div className="timer-ring" aria-label={`${label}: ${secondsLeft} seconds`}>
      <svg viewBox="0 0 80 80" role="img" aria-hidden="true">
        <circle cx="40" cy="40" r={radius} className="timer-ring__bg" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          className="timer-ring__fg"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
        />
      </svg>
      <div className="timer-ring__label">
        <strong>{secondsLeft}s</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}
