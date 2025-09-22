
import React from 'react';
import { Station } from '../types';

interface StationProps {
  station: Station;
}

const StationComponent: React.FC<StationProps> = ({ station }) => {
  return (
    <g>
      <rect 
        x={station.position.x - 20} 
        y={station.position.y - 12} 
        width="40" 
        height="24" 
        rx="4" 
        fill="#1e293b" 
        stroke="#334155" 
        strokeWidth="1.5"
      />
      <text 
        x={station.position.x} 
        y={station.position.y + 4} 
        fontSize="10" 
        fill="#cbd5e1" 
        textAnchor="middle"
        className="font-semibold tracking-wide"
      >
        {station.name}
      </text>
    </g>
  );
};

export default StationComponent;
