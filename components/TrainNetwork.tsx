
import React, { useMemo } from 'react';
import { Train, TrackSegment, Station, Node, TrainStatus } from '../types';
import TrainComponent from './Train';
import StationComponent from './Station';

interface TrainNetworkProps {
  trains: Train[];
  tracks: Record<string, TrackSegment>;
  stations: Station[];
  nodes: Record<string, Node>;
  selectedTrainId: string | null;
}

const TrainNetwork: React.FC<TrainNetworkProps> = ({ trains, tracks, stations, nodes, selectedTrainId }) => {
  const selectedTrain = selectedTrainId ? trains.find(t => t.id === selectedTrainId) : null;

  const conflictingTrackIds = useMemo(() => {
    const ids = new Set<string>();
    trains.forEach(train => {
        if (train.isConflicted && train.conflictingTrackIds) {
            train.conflictingTrackIds.forEach(id => ids.add(id));
        }
    });
    return ids;
  }, [trains]);

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
        {/* FIX: Explicitly type 'track' to resolve TypeScript inference issue where it was being treated as 'unknown'. */}
        {Object.values(tracks).map((track: TrackSegment) => {
            if (!track.svgPath) return null;

            const isConflictZone = !!track.conflictsWith;

            return (
                <g key={track.id}>
                    {/* Base path for thickness and interaction */}
                    <path
                        d={track.svgPath}
                        fill="none"
                        stroke="transparent"
                        strokeWidth="10"
                    />

                    {/* Add a pulsing glow for unoccupied conflict zones */}
                    {isConflictZone && track.occupiedBy.length === 0 && (
                        <path
                            d={track.svgPath}
                            fill="none"
                            stroke="#ef4444" // red-500
                            strokeWidth="8"
                            strokeLinecap="round"
                            className="conflict-glow"
                        />
                    )}

                    {/* Visual track line */}
                    <path
                        id={track.id} // ID for train component to reference
                        d={track.svgPath}
                        fill="none"
                        stroke={track.occupiedBy.length > 0 ? '#facc15' : '#64748b'} // Occupied is yellow, unoccupied is slate
                        strokeWidth={track.occupiedBy.length > 0 ? 4 : 2}
                        strokeLinecap="round"
                        className="transition-all duration-300"
                    />
                     <path
                        d={track.svgPath}
                        fill="none"
                        stroke="url(#trackGradient)"
                        strokeWidth="1"
                        strokeLinecap="round"
                    />

                    {/* Highlight for conflicting tracks */}
                    {conflictingTrackIds.has(track.id) && (
                        <path
                            d={track.svgPath}
                            fill="none"
                            stroke="#ef4444" // red-500
                            strokeWidth="4"
                            className="conflict-highlight-pulse"
                        />
                    )}
                </g>
            );
        })}

        {/* Render Stations */}
        {stations.map((station) => (
          <StationComponent key={station.id} station={station} />
        ))}
        
        {/* Render Junctions (as simple circles) */}
        {/* FIX: Explicitly type 'node' and 'junction' to resolve TypeScript inference issue where they were being treated as 'unknown'. */}
        {Object.values(nodes)
          .filter((node: Node) => node.id.startsWith('J'))
          .map((junction: Node) => (
            <circle key={junction.id} cx={junction.position.x} cy={junction.position.y} r="5" fill="#94a3b8" />
        ))}

        {/* Render Path Markers for Selected Train */}
        {selectedTrain && (() => {
          // Determine future path nodes
          const futurePathNodeIds = selectedTrain.path.slice(selectedTrain.pathIndex + 1);
          if (!futurePathNodeIds.length) return null;

          const nextNodeId = futurePathNodeIds[0];
          // Highlight if waiting or approaching (over 60% of track covered)
          const isApproaching = selectedTrain.status === TrainStatus.Moving && selectedTrain.progress > 0.6;
          
          return (
            <g>
              {futurePathNodeIds.map((nodeId) => {
                const node = nodes[nodeId];
                if (!node) return null;

                const isNextHighlightedNode = nodeId === nextNodeId && (selectedTrain.status === TrainStatus.Waiting || isApproaching);

                return (
                  <g key={`${selectedTrain.id}-marker-${nodeId}`} transform={`translate(${node.position.x}, ${node.position.y})`} style={{ pointerEvents: 'none' }}>
                    {isNextHighlightedNode ? (
                      // Highlighted diamond for the approaching/next stop
                      <path 
                        d="M-6 0 L0 6 L6 0 L0 -6 Z"
                        fill="rgba(56, 189, 248, 0.9)" // sky-400
                        stroke="#e0f2fe" // sky-100
                        strokeWidth="1.5"
                        className="waiting-pulse" // Re-using waiting-pulse for a nice effect
                        style={{ filter: 'drop-shadow(0 0 5px rgba(56, 189, 248, 1))' }}
                      />
                    ) : (
                      // Regular circle for subsequent stops
                      <circle 
                        cx="0" 
                        cy="0" 
                        r="3.5" 
                        fill="rgba(100, 116, 139, 0.7)" // slate-500
                        stroke="#e2e8f0" // slate-200
                        strokeWidth="1"
                      />
                    )}
                  </g>
                );
              })}
            </g>
          );
        })()}

        {/* Render Trains */}
        {trains.map((train) => (
          <TrainComponent key={train.id} train={train} tracks={tracks} nodes={nodes} />
        ))}
      </svg>
    </div>
  );
};

export default TrainNetwork;