
import React from 'react';

interface Alert {
  id: number;
  message: string;
  type: 'arrival' | 'conflict' | 'resolution';
}

interface AlertsProps {
  alerts: Alert[];
  onDismiss: (id: number) => void;
}

const ALERT_COLORS: Record<Alert['type'], string> = {
    arrival: 'bg-green-600/80',
    conflict: 'bg-rose-600/80',
    resolution: 'bg-blue-600/80',
};

const Alerts: React.FC<AlertsProps> = ({ alerts, onDismiss }) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className="flex flex-col items-center space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            role="alert"
            className={`animate-slide-in-toast w-full ${ALERT_COLORS[alert.type]} backdrop-blur-sm text-white font-semibold rounded-lg shadow-2xl p-4 flex items-center justify-between space-x-4`}
          >
            <span>{alert.message}</span>
            <button
              onClick={() => onDismiss(alert.id)}
              className="p-1 rounded-full hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Dismiss alert"
            >
              {/* FIX: Corrected a typo in the viewBox attribute of the SVG element. */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Alerts;
