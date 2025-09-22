import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Train, SimulationState, TrainStatus, TrackSegment, TrainType, Layout, Node } from './types';
import { TRAIN_PRIORITIES, TRAIN_COLORS } from './constants';
import { LAYOUTS } from './layouts';
import TrainNetwork from './components/TrainNetwork';
import ControlPanel from './components/ControlPanel';

// Helper to find all tracks between two nodes
const findTracksBetweenNodes = (startNodeId: string, endNodeId: string, allTracks: Record<string, TrackSegment>): TrackSegment[] => {
    return Object.values(allTracks).filter(
        track => track.startNode === startNodeId && track.endNode === endNodeId
    );
};


const App: React.FC = () => {
    const [currentLayout, setCurrentLayout] = useState<Layout>(LAYOUTS[0]);

    const createInitialState = useCallback((layout: Layout): SimulationState => {
        const newTrains = JSON.parse(JSON.stringify(layout.initialTrains));
        const newTracks = JSON.parse(JSON.stringify(layout.tracks));

        return {
            trains: newTrains,
            tracks: newTracks,
            time: 0,
            isRunning: false,
            logs: [`Simulation initialized with layout: "${layout.name}". Press play to start.`],
            simulationSpeed: 1,
        };
    }, []);

    const [simulationState, setSimulationState] = useState<SimulationState>(() => createInitialState(currentLayout));
    const requestRef = useRef<number | null>(null);

    const addLog = useCallback((message: string) => {
        setSimulationState(prevState => ({
            ...prevState,
            logs: [`[T+${prevState.time.toFixed(1)}] ${message}`, ...prevState.logs].slice(0, 20)
        }));
    }, []);
    
    const advanceSimulation = useCallback(() => {
        setSimulationState(prevState => {
            if (!prevState.isRunning) return prevState;

            let newState: SimulationState = JSON.parse(JSON.stringify(prevState));
            const timeStep = 0.1 / prevState.simulationSpeed;
            newState.time += timeStep;

            // Phase 1: Advance trains currently on a track
            newState.trains.forEach(train => {
                if (train.status === TrainStatus.Moving && train.currentTrackId) {
                    train.progress += train.speed * (1 / prevState.simulationSpeed);
                    train.progress = Math.min(train.progress, 1);
                }
            });

            // Phase 2: Process arrivals. Trains that finished a segment are now at a node.
            newState.trains.forEach(train => {
                if (train.progress >= 1 && train.currentTrackId) {
                    const finishedTrack = newState.tracks[train.currentTrackId];
                    if(prevState.trains.find(t=>t.id === train.id)?.status !== TrainStatus.Waiting) {
                         addLog(`${train.name} arrived at ${finishedTrack.endNode}.`);
                    }
                    finishedTrack.occupiedBy = null; // Release the track
                    train.currentTrackId = null;
                    train.pathIndex++;
                }
            });

            // Phase 3: Identify trains needing a new track and sort by priority
            const trainsRequestingMove = newState.trains
                .filter(train => train.status !== TrainStatus.Stopped && train.currentTrackId === null)
                .sort((a, b) => b.priority - a.priority);

            const grantedTracks = new Set<string>(); // Tracks granted in this tick

            // Phase 4: Granting process based on dynamic track availability
            for (const train of trainsRequestingMove) {
                // Check if train has finished its path
                if (train.pathIndex >= train.path.length - 1) {
                    if (train.status !== TrainStatus.Stopped) {
                        addLog(`${train.name} has reached its destination.`);
                        train.status = TrainStatus.Stopped;
                    }
                    continue;
                }

                const startNodeId = train.path[train.pathIndex];
                const endNodeId = train.path[train.pathIndex + 1];

                // Find all possible tracks for the next leg of the journey
                const candidateTracks = findTracksBetweenNodes(startNodeId, endNodeId, newState.tracks);

                let grantedTrack: TrackSegment | null = null;

                // Find the first available track
                for (const track of candidateTracks) {
                    const conflictTrackId = track.conflictsWith;
                    const isTargetOccupied = track.occupiedBy && newState.trains.find(t=>t.id === track.occupiedBy)?.progress < 1;
                    const isConflictOccupied = conflictTrackId && newState.tracks[conflictTrackId]?.occupiedBy;
                    
                    if (!isTargetOccupied && !isConflictOccupied && !grantedTracks.has(track.id) && !(conflictTrackId && grantedTracks.has(conflictTrackId))) {
                        grantedTrack = track;
                        break; // Found a free track
                    }
                }

                if (grantedTrack) {
                    // Grant the move
                    train.currentTrackId = grantedTrack.id;
                    train.progress = 0;
                    train.status = TrainStatus.Moving;
                    newState.tracks[grantedTrack.id].occupiedBy = train.id;

                    // Lock this track and its opposite for this tick
                    grantedTracks.add(grantedTrack.id);
                    if (grantedTrack.conflictsWith) {
                        grantedTracks.add(grantedTrack.conflictsWith);
                    }
                    
                    addLog(`${train.name} (${train.type}) proceeds to ${endNodeId} via ${grantedTrack.id}.`);

                } else {
                    // No tracks available, must wait
                    if (train.status !== TrainStatus.Waiting) {
                        addLog(`${train.name} (${train.type}) is waiting at ${startNodeId} for a free track to ${endNodeId}.`);
                        train.status = TrainStatus.Waiting;
                    }
                }
            }

            return newState;
        });
    }, [addLog]);


    useEffect(() => {
        if (!simulationState.isRunning) return;
        const animate = () => {
            advanceSimulation();
            requestRef.current = requestAnimationFrame(animate);
        };
        requestRef.current = requestAnimationFrame(animate);
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
    }, [simulationState.isRunning, advanceSimulation]);


    const handlePlayPause = () => {
        setSimulationState(prevState => ({
            ...prevState,
            isRunning: !prevState.isRunning,
            logs: !prevState.isRunning ? [`Simulation started.`, ...prevState.logs].slice(0,15) : [`Simulation paused.`, ...prevState.logs].slice(0,15)
        }));
    };

    const handleReset = () => {
        setSimulationState(createInitialState(currentLayout));
    };
    
    const handleSpeedChange = (newSpeed: number) => {
        setSimulationState(prevState => ({ ...prevState, simulationSpeed: newSpeed }));
    };

    const handleLayoutChange = (layoutName: string) => {
        const newLayout = LAYOUTS.find(l => l.name === layoutName);
        if (newLayout && newLayout.name !== currentLayout.name) {
            setCurrentLayout(newLayout);
            setSimulationState(createInitialState(newLayout));
        }
    };
    
    const getLength = (node1: Node, node2: Node): number => {
        const dx = node2.position.x - node1.position.x;
        const dy = node2.position.y - node1.position.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const handleAddTrack = (startNodeId: string, endNodeId: string) => {
        setSimulationState(prevState => {
            if (startNodeId === endNodeId) {
                addLog("ERROR: Start and end nodes cannot be the same.");
                return prevState;
            }
            
            // Generate a unique suffix for custom tracks to allow multiple parallels
            const existingTracks = Object.keys(prevState.tracks).filter(k => k.startsWith(`T_${startNodeId}_${endNodeId}`)).length;
            const suffix = `_custom${existingTracks > 0 ? `_${existingTracks}` : ''}`;

            const newTrackIdFwd = `T_${startNodeId}_${endNodeId}${suffix}`;
            const newTrackIdRev = `T_${endNodeId}_${startNodeId}${suffix}`;
    
            if (prevState.tracks[newTrackIdFwd]) {
                addLog("ERROR: A track with this ID already exists.");
                return prevState;
            }
            
            const startNode = currentLayout.nodes[startNodeId];
            const endNode = currentLayout.nodes[endNodeId];
            const length = getLength(startNode, endNode);
    
            const newTrackFwd: TrackSegment = { id: newTrackIdFwd, startNode: startNodeId, endNode: endNodeId, length, occupiedBy: null, conflictsWith: newTrackIdRev };
            const newTrackRev: TrackSegment = { id: newTrackIdRev, startNode: endNodeId, endNode: startNodeId, length, occupiedBy: null, conflictsWith: newTrackIdFwd };
    
            const newTracks = { ...prevState.tracks, [newTrackIdFwd]: newTrackFwd, [newTrackIdRev]: newTrackRev };
            
            addLog(`Added new track between ${startNode.id} and ${endNode.id}.`);
            return { ...prevState, tracks: newTracks };
        });
    };

    const handleAddTrain = (data: { name: string; type: TrainType; path: string[] }) => {
        setSimulationState(prevState => {
            const newTrain: Train = {
                id: `train-${data.type.toLowerCase()}-${Date.now()}`,
                name: data.name || `${data.type} Special`,
                type: data.type,
                color: TRAIN_COLORS[data.type],
                priority: TRAIN_PRIORITIES[data.type],
                path: data.path,
                pathIndex: 0,
                currentTrackId: null,
                progress: -0.01, // Start slightly before the network
                speed: 0.01,
                status: TrainStatus.Moving,
            };
            
            addLog(`New train "${newTrain.name}" queued for entry.`);

            return {
                ...prevState,
                trains: [...prevState.trains, newTrain],
            };
        });
    };

    return (
        <div className="flex flex-col h-screen bg-slate-900 text-slate-50 font-sans">
            <header className="text-center p-4 border-b border-slate-700 bg-slate-800/50">
                <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">Train Network Simulation</h1>
                <p className="text-sm text-slate-400">Demonstrating Dynamic Track Selection and Priority-Based Conflict Resolution</p>
            </header>
            <main className="flex flex-grow overflow-hidden">
                <div className="w-3/4 p-4 flex items-center justify-center">
                    <TrainNetwork 
                        trains={simulationState.trains} 
                        tracks={simulationState.tracks} 
                        stations={currentLayout.stations}
                        nodes={currentLayout.nodes}
                    />
                </div>
                <aside className="w-1/4 bg-slate-800/70 border-l border-slate-700 p-4 overflow-y-auto">
                    <ControlPanel 
                        isRunning={simulationState.isRunning} 
                        onPlayPause={handlePlayPause} 
                        onReset={handleReset}
                        onSpeedChange={handleSpeedChange}
                        simulationSpeed={simulationState.simulationSpeed}
                        logs={simulationState.logs}
                        onAddTrain={handleAddTrain}
                        onAddTrack={handleAddTrack}
                        nodes={currentLayout.nodes}
                        layouts={LAYOUTS}
                        currentLayoutName={currentLayout.name}
                        onLayoutChange={handleLayoutChange}
                        predefinedPaths={currentLayout.predefinedPaths}
                    />
                </aside>
            </main>
        </div>
    );
};

export default App;
