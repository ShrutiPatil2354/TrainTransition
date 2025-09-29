
import React from 'react';
import { Train, TrackSegment, Node, TrainStatus } from '../types';

interface PredictionPanelProps {
  train: Train;
  tracks: Record<string, TrackSegment>;
  trains: Train[];
  nodes: Record<string, Node>;
}

// A simplified helper to find tracks between nodes, for prediction.
const findTracksBetween = (startNodeId: string, endNodeId: string, allTracks: Record<string, TrackSegment>): TrackSegment[] => {
    return Object.values(allTracks).filter(
        track => track.startNode === startNodeId && track.endNode === endNodeId
    );
};

const PredictionPanel: React.FC<PredictionPanelProps> = ({ train, tracks, trains }) => {
  if (!train) return null;

  const predictFutureConflicts = () => {
    let predictedDelay = 0;
    const conflicts: { reason: string; delay: number }[] = [];
    const maxPredictionDepth = 5; // Look ahead 5 path segments

    // Start prediction from the train's current or next segment
    let currentPathIndex = train.pathIndex;

    // If the train is currently on a track, start prediction from the *next* segment
    if (train.currentTrackId && train.status === TrainStatus.Moving) {
        currentPathIndex++;
    }

    for (let i = 0; i < maxPredictionDepth && currentPathIndex < train.path.length - 1; i++, currentPathIndex++) {
        const startNodeId = train.path[currentPathIndex];
        const endNodeId = train.path[currentPathIndex + 1];

        const candidateTracks = findTracksBetween(startNodeId, endNodeId, tracks);

        // Check for track occupancy
        const blockingTrainsData = candidateTracks
            .map(track => {
                // If track is empty, it's not blocking.
                if (track.occupiedBy.length === 0) return null;

                // For simplicity, we only consider the *first* train on the track as the blocker for prediction.
                const occupant = trains.find(t => t.id === track.occupiedBy[0]);
                return occupant ? { train: occupant, track } : null;
            })
            .filter((item): item is { train: Train; track: TrackSegment } => item !== null);

        // A conflict exists if the number of blocked tracks equals the number of available tracks.
        if (blockingTrainsData.length === candidateTracks.length && candidateTracks.length > 0) {
            const blockerData = blockingTrainsData[0]; // Simplification: just consider the first blocker
            // The delay calculation is no longer perfect, but it still signals a potential delay.
            const estimatedTimeToClear = Math.max(0, (1 - blockerData.train.progress) * blockerData.track.length / (blockerData.train.speed || 25));
            predictedDelay += estimatedTimeToClear;
            conflicts.push({
                reason: `Track to ${endNodeId} may be occupied by ${blockerData.train.name}.`,
                delay: estimatedTimeToClear,
            });
        }

        // Check for higher-priority trains waiting at the same junction
        const rivalTrains = trains.filter(t =>
            t.id !== train.id &&
            t.status === TrainStatus.Waiting &&
            t.path[t.pathIndex] === startNodeId &&
            t.priority > train.priority
        );
        
        if (rivalTrains.length > 0) {
            const rivalNames = rivalTrains.map(t => t.name).join(', ');
            // Simple delay estimate: assume 10 seconds per rival train
            const rivalDelay = rivalTrains.length * 10;
            predictedDelay += rivalDelay;
            conflicts.push({
                reason: `Higher priority trains (${rivalNames}) waiting at ${startNodeId}.`,
                delay: rivalDelay,
            });
        }
    }

    return { totalDelay: predictedDelay, conflicts };
  };

  const prediction = predictFutureConflicts();

  return (
    <div className="p-4 animate-fade-in-down">
      <h3 className="text-lg font-semibold mb-2 text-cyan-400">AI Prediction for {train.name}</h3>
      <div className="bg-slate-900/50 rounded-md p-3 space-y-3">
        <div className="text-center">
            <p className="text-sm text-slate-400">Predicted Additional Delay</p>
            <p className={`text-3xl font-bold ${prediction.totalDelay > 0.1 ? 'text-amber-400' : 'text-green-400'}`}>
                {prediction.totalDelay.toFixed(1)}s
            </p>
        </div>
        {prediction.conflicts.length > 0 ? (
            <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-1">Potential Conflict Points:</h4>
                <ul className="text-xs text-slate-400 list-disc list-inside space-y-1">
                    {prediction.conflicts.map((c, i) => (
                        <li key={i}>{c.reason} (Est. +{c.delay.toFixed(1)}s)</li>
                    ))}
                </ul>
            </div>
        ) : (
             <p className="text-sm text-center text-green-400">Path appears clear for the next few segments.</p>
        )}
      </div>
    </div>
  );
};

export default PredictionPanel;
