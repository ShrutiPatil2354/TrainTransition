import React from 'react';
import { Train, TrackSegment, Station, Node } from '../types';
import TrainComponent from './Train';
import StationComponent from './Station';

interface TrainNetworkProps {
  trains: Train[];
  tracks: Record<string, TrackSegment>;
  stations: Station[];
  nodes: Record<string, Node>;
}

const TrainNetwork: React.FC<TrainNetworkProps> = ({ trains, tracks, stations, nodes }) => {
  return (
    <div className="relative w-full aspect-[2/1] bg-slate-800 rounded-lg shadow-inner overflow-hidden border border-slate-700">
      <svg width="100%" height="100%" viewBox="0 0 800 400">
        <defs>
            <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor: '#475569', stopOpacity: 1}} />
                <stop offset="50%" style={{stopColor: '#64748b', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#475569', stopOpacity: 1}} />
            </linearGradient>
        </defs>

        {/* Render Tracks */}
        {Object.values(tracks).map((track: TrackSegment) => {
          const start = nodes[track.startNode]?.position;
          const end = nodes[track.endNode]?.position;
          if (!start || !end) return null; // Don't render if a node is missing

          const isConflictZone = !!track.conflictsWith;

          return (
            <g key={track.id}>
                {/* Add a pulsing glow for unoccupied conflict zones */}
                {isConflictZone && !track.occupiedBy && (
                    <line
                        x1={start.x}
                        y1={start.y}
                        x2={end.x}
                        y2={end.y}
                        stroke="#ef4444" // red-500
                        strokeWidth="8"
                        strokeLinecap="round"
                        className="conflict-glow"
                    />
                )}

                <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={track.occupiedBy ? '#facc15' : '#64748b'} // Occupied is yellow, unoccupied is slate
                    strokeWidth={track.occupiedBy ? 4 : 2}
                    className="transition-all duration-300"
                />
                 <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke="url(#trackGradient)"
                    strokeWidth="1"
                />
            </g>
          );
        })}

        {/* Render Stations */}
        {stations.map((station) => (
          <StationComponent key={station.id} station={station} />
        ))}
        
        {/* Render Junctions (as simple circles) */}
        {Object.values(nodes)
          .filter(node => node.id.startsWith('J'))
          .map(junction => (
            <circle key={junction.id} cx={junction.position.x} cy={junction.position.y} r="5" fill="#94a3b8" />
        ))}

        {/* Render Trains */}
        {trains.map((train) => (
          <TrainComponent key={train.id} train={train} tracks={tracks} nodes={nodes} />
        ))}
      </svg>
    </div>
  );
};

export default TrainNetwork;