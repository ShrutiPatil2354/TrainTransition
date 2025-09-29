
import React, { useMemo } from 'react';
import { Train, TrackSegment, TrainStatus, Node } from '../types';

interface TrainProps {
  train: Train;
  tracks: Record<string, TrackSegment>;
  nodes: Record<string, Node>;
}

const TrainComponent: React.FC<TrainProps> = ({ train, tracks, nodes }) => {
  const positionAndAngle = useMemo(() => {
    let x: number, y: number, angle: number;

    const currentTrack = train.currentTrackId ? tracks[train.currentTrackId] : null;

    if (currentTrack) {
      // FIX: Cast to `unknown` before `SVGPathElement` because TypeScript considers `HTMLElement` (return type of getElementById) and `SVGPathElement` not sufficiently overlapping for a direct cast.
      const pathElement = document.getElementById(currentTrack.id) as unknown as SVGPathElement | null;
      if (pathElement && currentTrack.length > 0) {
        // OPTIMIZATION: Use pre-calculated track length instead of calling `getTotalLength()` on every frame.
        const totalLength = currentTrack.length;
        const progressLength = Math.max(0, Math.min(1, train.progress)) * totalLength;

        const currentPoint = pathElement.getPointAtLength(progressLength);
        x = currentPoint.x;
        y = currentPoint.y;

        // For angle, look slightly ahead on the path
        const lookaheadPoint = pathElement.getPointAtLength(Math.min(totalLength, progressLength + 1));
        angle = Math.atan2(lookaheadPoint.y - currentPoint.y, lookaheadPoint.x - currentPoint.x) * (180 / Math.PI);
      } else {
        // Fallback for when path element isn't found yet (e.g., first render)
        // Position at the start node of the track.
        const startNode = nodes[currentTrack.startNode];
        const endNode = nodes[currentTrack.endNode];
        x = startNode.position.x;
        y = startNode.position.y;
        angle = Math.atan2(endNode.position.y - startNode.position.y, endNode.position.x - startNode.position.x) * (180 / Math.PI);
      }
    } else {
      // Train is waiting at a node
      if (train.pathIndex >= train.path.length) return { x: -100, y: -100, angle: 0 };

      const currentNodeId = train.path[train.pathIndex];
      const currentNode = nodes[currentNodeId];
      if (!currentNode) return { x: -100, y: -100, angle: 0 };

      x = currentNode.position.x;
      y = currentNode.position.y;

      // Point towards the next destination
      const nextNodeId = train.path[train.pathIndex + 1];
      const nextNode = nextNodeId ? nodes[nextNodeId] : null;
      
      if (nextNode) {
        angle = Math.atan2(nextNode.position.y - currentNode.position.y, nextNode.position.x - currentNode.position.x) * (180 / Math.PI);
      } else {
        angle = 0; 
      }
    }

    return { x, y, angle };
  }, [train, tracks, nodes]);
  
  const isWaiting = train.status === TrainStatus.Waiting;
  const isConflicted = train.isConflicted;

  let trainColor = train.color;
  if (isConflicted) {
    trainColor = '#ef4444'; // red-500
  } else if (isWaiting) {
    trainColor = '#f59e0b'; // amber-500 for waiting
  }

  const getTrainClassName = () => {
    if (isConflicted) return 'train-glow train-conflict-glow';
    if (isWaiting) return 'train-glow waiting-pulse waiting-glow';
    return 'train-glow';
  };

  return (
    <g
      style={{
        transform: `translate(${positionAndAngle.x}px, ${positionAndAngle.y}px)`,
        color: trainColor,
      }}
      className={getTrainClassName()}
    >
      <g style={{ transform: `rotate(${positionAndAngle.angle}deg)` }}>
        <rect x="-12" y="-5" width="24" height="10" rx="3" fill="currentColor" />
        <rect x="5" y="-3" width="6" height="6" fill="#f8fafc" opacity="0.8" />
      </g>
      <text
        x="0"
        y="20"
        fontSize="8"
        fill="#f8fafc"
        textAnchor="middle"
        style={{ pointerEvents: 'none', textShadow: '0 0 3px black' }}
      >
        {train.name}
      </text>
      {train.waitTime > 0.1 && (
         <text
            x="0"
            y="-15"
            fontSize="7"
            fill="#ef4444" // red-500
            textAnchor="middle"
            className="font-semibold"
            style={{ pointerEvents: 'none', textShadow: '0 0 3px black' }}
         >
            Wait: {train.waitTime.toFixed(1)}s
         </text>
      )}
    </g>
  );
};

export default TrainComponent;