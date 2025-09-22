
import React from 'react';
import { Train, TrackSegment, TrainStatus, Node } from '../types';

interface TrainProps {
  train: Train;
  tracks: Record<string, TrackSegment>;
  nodes: Record<string, Node>;
}

const TrainComponent: React.FC<TrainProps> = ({ train, tracks, nodes }) => {
  if (train.status === TrainStatus.Stopped) return null;

  let x: number, y: number, angle: number;

  const currentTrack = train.currentTrackId ? tracks[train.currentTrackId] : null;

  if (currentTrack) {
    // Case 1: Train is on a track, moving.
    const start = nodes[currentTrack.startNode]?.position;
    const end = nodes[currentTrack.endNode]?.position;
    if (!start || !end) return null;

    // The progress value will correctly position the train along the segment.
    // A negative progress means it's just entering the network on this track.
    const RENDER_PROGRESS = Math.max(0, train.progress);

    x = start.x + (end.x - start.x) * RENDER_PROGRESS;
    y = start.y + (end.y - start.y) * RENDER_PROGRESS;
    angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);
  } else {
    // Case 2: Train is at a node (waiting or just arrived).
    if (train.pathIndex >= train.path.length) return null; // Finished path
    
    const currentNodeId = train.path[train.pathIndex];
    const currentNode = nodes[currentNodeId];
    if (!currentNode) return null;

    // Position the train directly at the node.
    x = currentNode.position.x;
    y = currentNode.position.y;

    // Point the train towards its next destination for better visual feedback.
    const nextNodeId = train.path[train.pathIndex + 1];
    const nextNode = nextNodeId ? nodes[nextNodeId] : null;
    
    if (nextNode) {
      angle = Math.atan2(nextNode.position.y - currentNode.position.y, nextNode.position.x - currentNode.position.x) * (180 / Math.PI);
    } else {
      angle = 0; // Train is at its final destination.
    }
  }

  const isWaiting = train.status === TrainStatus.Waiting;
  const trainColor = isWaiting ? '#f59e0b' : train.color; // amber-500 for waiting

  return (
    <g
      style={{
        transform: `translate(${x}px, ${y}px)`,
        transition: 'transform 0.1s linear',
        color: trainColor,
      }}
      className={`train-glow ${isWaiting ? 'waiting-pulse waiting-glow' : ''}`}
    >
      <g style={{ transform: `rotate(${angle}deg)` }}>
        <rect x="-12" y="-5" width="24" height="10" rx="3" fill="currentColor" />
        <rect x="5" y="-3" width="6" height="6" fill="#f8fafc" opacity="0.8" />
      </g>
      <text
        x="0"
        y="20"
        fontSize="8"
        fill="#f8fafc"
        textAnchor="middle"
        style={{ pointerEvents: 'none' }}
      >
        {train.name}
      </text>
    </g>
  );
};

export default TrainComponent;
