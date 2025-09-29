

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Train, SimulationState, TrainStatus, TrackSegment, TrainType, Layout, Node, Station } from './types';
import { TRAIN_PRIORITIES, TRAIN_COLORS, ARRIVAL_SOUND_URI } from './constants';
import { LAYOUTS } from './layouts';
import TrainNetwork from './components/TrainNetwork';
import ControlPanel from './components/ControlPanel';
import Alerts from './components/Alerts';

interface Alert {
  id: number;
  message: string;
  type: 'arrival' | 'conflict' | 'resolution';
}

// Helper to calculate the length of an SVG path string.
// It works by creating a temporary path element in the DOM and measuring it.
const calculateSVGLength = (d: string): number => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    return path.getTotalLength();
};

// Helper to find all tracks between two nodes
const findTracksBetweenNodes = (startNodeId: string, endNodeId: string, allTracks: Record<string, TrackSegment>): TrackSegment[] => {
    return Object.values(allTracks).filter(
        track => track.startNode === startNodeId && track.endNode === endNodeId
    );
};

const SAFE_FOLLOWING_PROGRESS = 0.15; // Train must be 15% down the track before another can follow.

const App: React.FC = () => {
    const [currentLayout, setCurrentLayout] = useState<Layout>(LAYOUTS[0]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [selectedTrainId, setSelectedTrainId] = useState<string | null>(null);
    const [isStopModalVisible, setIsStopModalVisible] = useState(false);
    const arrivalAudioRef = useRef<HTMLAudioElement | null>(null);

    const createInitialState = useCallback((layout: Layout): SimulationState => {
        // Deep copy to prevent mutations of the original layout config
        const newTrains = JSON.parse(JSON.stringify(layout.initialTrains));
        const newTracks = JSON.parse(JSON.stringify(layout.tracks));
        const newNodes = JSON.parse(JSON.stringify(layout.nodes));

        // Process tracks: calculate lengths from SVG paths or generate paths for old layouts
        for (const trackId in newTracks) {
            const track = newTracks[trackId];
            if (!track.svgPath) {
                // Backward compatibility: create a straight-line path for layouts without one
                const start = newNodes[track.startNode].position;
                const end = newNodes[track.endNode].position;
                track.svgPath = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
            }
            // All tracks must have a length for physics calculations.
            track.length = calculateSVGLength(track.svgPath);
        }

        return {
            trains: newTrains,
            tracks: newTracks,
            nodes: newNodes,
            stations: JSON.parse(JSON.stringify(layout.stations)),
            time: 0,
            isRunning: false,
            logs: [`Simulation initialized with layout: "${layout.name}". Press play to start.`],
            simulationSpeed: 1,
        };
    }, []);

    const [simulationState, setSimulationState] = useState<SimulationState>(() => createInitialState(currentLayout));
    const requestRef = useRef<number | null>(null);

    useEffect(() => {
        arrivalAudioRef.current = new Audio(ARRIVAL_SOUND_URI);
    }, []);

    const addLog = useCallback((message: string) => {
        setSimulationState(prevState => ({
            ...prevState,
            logs: [`[T+${prevState.time.toFixed(1)}] ${message}`, ...prevState.logs].slice(0, 50)
        }));
    }, []);

    const addAlert = useCallback((message: string, type: Alert['type']) => {
        const newAlert = { id: Date.now() + Math.random(), message, type };
        setAlerts(prev => [...prev, newAlert]);
        
        if (type === 'arrival' && arrivalAudioRef.current) {
            arrivalAudioRef.current.currentTime = 0;
            arrivalAudioRef.current.play().catch(e => console.warn("Audio playback was prevented.", e));
        }
    }, []);
    
    const advanceSimulation = useCallback(() => {
        setSimulationState(prevState => {
            if (!prevState.isRunning) return prevState;

            let newState: SimulationState = JSON.parse(JSON.stringify(prevState));
            const timeStep = 0.016; // Assuming ~60 FPS
            newState.time += timeStep * prevState.simulationSpeed;

            // Phase 0: Cleanup trains that have completed their service and disappeared.
            const trainsBeforeCleanup = newState.trains.length;
            newState.trains = newState.trains.filter(train => {
                const shouldDisappear = train.status === TrainStatus.Stopped && train.disappearAt && newState.time >= train.disappearAt;
                if (shouldDisappear) {
                    // Release the track it was occupying at the station
                    if (train.currentTrackId && newState.tracks[train.currentTrackId]) {
                         const track = newState.tracks[train.currentTrackId];
                         track.occupiedBy = track.occupiedBy.filter(id => id !== train.id);
                    }
                    addLog(`Train ${train.name} has completed its service.`);
                    return false; // Remove train from simulation
                }
                return true;
            });
            if (newState.trains.length < trainsBeforeCleanup) {
                // If a train was removed, we might need to update the selected train
                if (selectedTrainId && !newState.trains.find(t => t.id === selectedTrainId)) {
                    setSelectedTrainId(null);
                }
            }


            // Phase 1: Advance trains and update wait times
            newState.trains.forEach(train => {
                if (train.status === TrainStatus.Moving && train.currentTrackId) {
                    const track = newState.tracks[train.currentTrackId];
                    if (track && track.length > 0) {
                        // New distance-based speed calculation
                        const distanceToMove = train.speed * timeStep * prevState.simulationSpeed;
                        const progressIncrement = distanceToMove / track.length;
                        train.progress += progressIncrement;
                        train.progress = Math.min(train.progress, 1);
                    }
                } else if (train.status === TrainStatus.Waiting) {
                    train.waitTime += timeStep * prevState.simulationSpeed;
                }
            });

            // Phase 2: Process arrivals at junctions and final destinations.
            newState.trains.forEach(train => {
                if (train.progress >= 1 && train.currentTrackId) {
                    const finishedTrack = newState.tracks[train.currentTrackId];
                    const isFinalArrival = train.pathIndex >= train.path.length - 2;
                    
                    if (isFinalArrival) {
                        // Handle final destination arrival.
                        if (train.status !== TrainStatus.Stopped) {
                            train.status = TrainStatus.Stopped;
                            // Set a timer for when the train should disappear from the map.
                            // The train will remain on its currentTrackId, occupying it visually.
                            train.disappearAt = newState.time + 3; // Disappear in 3 sim seconds.
                            const destStation = newState.stations.find(s => s.id === finishedTrack.endNode);
                            addLog(`🚉 Train ${train.name} has reached destination ${destStation?.name || finishedTrack.endNode}.`);
                            addAlert(`🚉 ${train.name} has arrived at ${destStation?.name || finishedTrack.endNode}.`, 'arrival');
                        }
                    } else {
                        // Handle intermediate junction stop.
                        finishedTrack.occupiedBy = finishedTrack.occupiedBy.filter(id => id !== train.id); // Release the track.
                        train.currentTrackId = null;
                        train.progress = 0;
                        train.pathIndex++;
                        train.status = TrainStatus.Waiting; // Set to Waiting to request the next track.
                        addLog(`${train.name} arrived at junction ${finishedTrack.endNode}.`);
                    }
                }
            });

            // Phase 3: Identify trains needing a new track and sort by priority for conflict resolution.
            const trainsRequestingMove = newState.trains
                .filter(train => train.status === TrainStatus.Waiting && train.currentTrackId === null)
                .sort((a, b) => b.priority - a.priority);

            const grantedTracksInTick = new Set<string>(); // Tracks assigned in this simulation step.

            // Phase 4: AI-driven track assignment and conflict resolution.
            for (const train of trainsRequestingMove) {
                if (train.pathIndex >= train.path.length - 1) continue; // Should have been handled by arrival logic.
                
                const startNodeId = train.path[train.pathIndex];
                const endNodeId = train.path[train.pathIndex + 1];
                const candidateTracks = findTracksBetweenNodes(startNodeId, endNodeId, newState.tracks);

                let grantedTrack: TrackSegment | null = null;

                // Find the first available track, allowing trains to follow each other.
                for (const track of candidateTracks) {
                    if (grantedTracksInTick.has(track.id)) continue; // Already granted to another new train this tick.

                    if (track.occupiedBy.length === 0) {
                        grantedTrack = track; // Track is completely free.
                        break;
                    } else {
                        // Track is occupied, check if we can safely follow the last train.
                        const lastTrainIdOnTrack = track.occupiedBy[track.occupiedBy.length - 1];
                        const leadingTrain = newState.trains.find(t => t.id === lastTrainIdOnTrack);

                        if (leadingTrain && leadingTrain.progress > SAFE_FOLLOWING_PROGRESS) {
                            grantedTrack = track; // Safe to follow.
                            break;
                        }
                    }
                }

                if (grantedTrack) {
                    // Resolution: A track is available, grant it.
                    train.currentTrackId = grantedTrack.id;
                    train.progress = 0;
                    train.status = TrainStatus.Moving;
                    newState.tracks[grantedTrack.id].occupiedBy.push(train.id);
                    grantedTracksInTick.add(grantedTrack.id);
                    
                    if (train.isConflicted) {
                        addLog(`✅ CONFLICT RESOLVED: Path to ${endNodeId} is now clear for ${train.name}.`);
                        addAlert(`✅ CONFLICT RESOLVED: ${train.name} is now moving.`, 'resolution');
                    }
                    train.conflictingTrackIds = null;
                    train.isConflicted = false;
                    train.conflictReason = null;
                    addLog(`${train.name} (${train.type}) proceeds to ${endNodeId}.`);

                } else {
                    // Conflict: No tracks are available, train must wait.
                    if (!train.isConflicted) {
                        train.isConflicted = true; // Set flag to avoid spamming logs.
                        train.conflictingTrackIds = candidateTracks.map(t => t.id);
                        addLog(`⚠️ CONFLICT CREATED: ${train.name} is waiting at ${startNodeId} for a free track to ${endNodeId}.`);
                        addAlert(`⚠️ CONFLICT at ${startNodeId}!`, 'conflict');
                        
                        // Explain the AI's reasoning.
                        const blockers = candidateTracks
                            .flatMap(t => t.occupiedBy.map(trainId => newState.trains.find(tr => tr.id === trainId)))
                            .filter((t): t is Train => !!t);
                        
                        const uniqueBlockerNames = [...new Set(blockers.map(b => b.name))];

                        const waitingRivals = trainsRequestingMove.filter(t => 
                            t.id !== train.id && 
                            t.path[t.pathIndex] === startNodeId && 
                            t.priority > train.priority
                        );
                        
                        let reason = '';
                        const leadTrain = blockers.length > 0 ? blockers[blockers.length - 1] : null;

                        if (leadTrain && leadTrain.progress <= SAFE_FOLLOWING_PROGRESS) {
                            reason = `Waiting for safe distance from ${leadTrain.name}.`;
                        } else if (uniqueBlockerNames.length > 0) {
                            reason = `Blocked by: ${uniqueBlockerNames.join(', ')}.`;
                        } else if (waitingRivals.length > 0) {
                            reason = `Yielding to: ${waitingRivals.map(r => r.name).join(', ')}.`;
                        } else {
                            reason = `Awaiting free track to ${endNodeId}.`;
                        }
                        
                        train.conflictReason = reason;

                        let logReason = reason;
                        if (waitingRivals.length > 0 && !logReason.startsWith('Yielding')) {
                           logReason += ` Also yielding to higher priority trains.`
                        }
                        addLog(`🤖 AI RECOMMENDATION: Delaying ${train.name} (Priority ${train.priority}). ${logReason}`);
                    }
                }
            }

            return newState;
        });
    }, [addLog, addAlert, selectedTrainId]);


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
        setAlerts([]);
        setSelectedTrainId(null);
    };
    
    const handleSpeedChange = (newSpeed: number) => {
        setSimulationState(prevState => ({ ...prevState, simulationSpeed: newSpeed }));
    };

    const handleEmergencyStopConfirm = () => {
        addLog("🚨 EMERGENCY STOP ACTIVATED. All trains halted.");
        setSimulationState(prevState => {
            const updatedTrains = prevState.trains.map(train => {
                if (train.status === TrainStatus.Moving) {
                    return { ...train, status: TrainStatus.Waiting };
                }
                return train;
            });
    
            return {
                ...prevState,
                isRunning: false,
                trains: updatedTrains,
            };
        });
        setIsStopModalVisible(false);
    };

    const handleLayoutChange = (layoutName: string) => {
        const newLayout = LAYOUTS.find(l => l.name === layoutName);
        if (newLayout && newLayout.name !== currentLayout.name) {
            setCurrentLayout(newLayout);
            setSimulationState(createInitialState(newLayout));
            setAlerts([]);
            setSelectedTrainId(null);
        }
    };
    
    const handleAddStation = (data: { name: string; id: string; x: number; y: number }) => {
        setSimulationState(prevState => {
            const { name, id, x, y } = data;
            const upperId = id.toUpperCase();

            if (prevState.nodes[upperId]) {
                addLog(`ERROR: A node or station with ID "${upperId}" already exists.`);
                return prevState;
            }
            if (!/^[A-Z0-9]{2,4}$/.test(upperId)) {
                addLog(`ERROR: Station ID must be 2-4 uppercase letters/numbers.`);
                return prevState;
            }

            const newStation: Station = {
                id: upperId,
                name: name,
                position: { x, y }
            };

            const newNodes = { ...prevState.nodes, [upperId]: newStation };
            const newStations = [...prevState.stations, newStation];

            addLog(`Added new station: "${name}" (${upperId}).`);

            return {
                ...prevState,
                nodes: newNodes,
                stations: newStations
            };
        });
    };

    const handleAddTrack = (startNodeId: string, endNodeId: string) => {
        setSimulationState(prevState => {
            if (startNodeId === endNodeId) {
                addLog("ERROR: Start and end nodes cannot be the same.");
                return prevState;
            }
            
            const existingTracks = Object.values(prevState.tracks).filter((t: TrackSegment) => t.startNode === startNodeId && t.endNode === endNodeId).length;
            const suffix = existingTracks > 0 ? `_p${existingTracks + 1}` : '';

            const newTrackIdFwd = `T_${startNodeId}_${endNodeId}${suffix}`;
            
            if (prevState.tracks[newTrackIdFwd]) {
                addLog("ERROR: A track with this ID already exists.");
                return prevState;
            }
            
            const startNode = prevState.nodes[startNodeId];
            const endNode = prevState.nodes[endNodeId];

            if (!startNode || !endNode) {
                addLog(`ERROR: Could not find node IDs ${startNodeId} or ${endNodeId}.`);
                return prevState;
            }

            const startPos = startNode.position;
            const endPos = endNode.position;
            const newPath = `M ${startPos.x} ${startPos.y} L ${endPos.x} ${endPos.y}`;
            const length = calculateSVGLength(newPath);
    
            const newTrackFwd: TrackSegment = { 
                id: newTrackIdFwd, 
                startNode: startNodeId, 
                endNode: endNodeId, 
                length, 
                occupiedBy: [],
                svgPath: newPath
            };
    
            const newTracks = { ...prevState.tracks, [newTrackIdFwd]: newTrackFwd };
            
            addLog(`Added new track between ${startNode.id} and ${endNode.id}.`);
            return { ...prevState, tracks: newTracks };
        });
    };

    const handleAddTrain = (data: { name: string; type: TrainType; path: string[] }) => {
        setSimulationState(prevState => {
            // Find the base speed from a similar train type in the layout if possible, or default
            const similarTrain = currentLayout.initialTrains.find(t => t.type === data.type);
            const speed = similarTrain ? similarTrain.speed : 25;

            const newTrain: Train = {
                id: `train-${data.type.toLowerCase()}-${Date.now()}`,
                name: data.name || `${data.type} Special`,
                type: data.type,
                color: TRAIN_COLORS[data.type],
                priority: TRAIN_PRIORITIES[data.type],
                path: data.path,
                pathIndex: 0,
                currentTrackId: null,
                progress: -0.01, // Start slightly before the network to trigger entry logic
                speed: speed, // Speed in pixels per second
                status: TrainStatus.Waiting, // Start as waiting to request first track
                waitTime: 0,
                disappearAt: null,
                isConflicted: false,
                conflictingTrackIds: null,
                conflictReason: null,
            };
            
            addLog(`New train "${newTrain.name}" queued for entry.`);

            return {
                ...prevState,
                trains: [...prevState.trains, newTrain],
            };
        });
    };
    
    const handleRemoveTrain = (trainId: string) => {
        setSimulationState(prevState => {
            if (selectedTrainId === trainId) {
                setSelectedTrainId(null);
            }

            const trainToRemove = prevState.trains.find(t => t.id === trainId);
            if (!trainToRemove) return prevState;

            const newTrains = prevState.trains.filter(t => t.id !== trainId);
            const newTracks = { ...prevState.tracks };

            if (trainToRemove.currentTrackId && newTracks[trainToRemove.currentTrackId]) {
                const track = newTracks[trainToRemove.currentTrackId];
                track.occupiedBy = track.occupiedBy.filter(id => id !== trainId);
            }
            
            addLog(`Train "${trainToRemove.name}" was removed.`);

            return {
                ...prevState,
                trains: newTrains,
                tracks: newTracks,
            };
        });
    };

    const handleDismissAlert = (id: number) => {
        setAlerts(alerts => alerts.filter(alert => alert.id !== id));
    };

    const handleSelectTrain = (trainId: string | null) => {
        setSelectedTrainId(trainId);
    };

    return (
        <div className="relative flex flex-col h-screen bg-slate-900 text-slate-50 font-sans">
            <Alerts alerts={alerts} onDismiss={handleDismissAlert} />
            <header className="text-center p-4 border-b border-slate-700 bg-slate-800/50">
                <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">Train Network Simulation</h1>
                <p className="text-sm text-slate-400">AI-Powered Conflict Resolution and Traffic Management</p>
            </header>
            <main className="flex flex-grow overflow-hidden">
                <div className="w-3/4 p-4 flex flex-col items-center justify-center">
                    <div className="flex-grow w-full">
                        <TrainNetwork 
                            trains={simulationState.trains} 
                            tracks={simulationState.tracks} 
                            stations={simulationState.stations}
                            nodes={simulationState.nodes}
                            selectedTrainId={selectedTrainId}
                        />
                    </div>
                </div>
                <aside className="w-1/4 bg-slate-800/70 border-l border-slate-700 p-4 overflow-y-auto">
                    <ControlPanel 
                        isRunning={simulationState.isRunning} 
                        onPlayPause={handlePlayPause} 
                        onReset={handleReset}
                        onEmergencyStop={() => setIsStopModalVisible(true)}
                        onSpeedChange={handleSpeedChange}
                        simulationSpeed={simulationState.simulationSpeed}
                        logs={simulationState.logs}
                        onAddTrain={handleAddTrain}
                        onAddTrack={handleAddTrack}
                        onAddStation={handleAddStation}
                        nodes={simulationState.nodes}
                        layouts={LAYOUTS}
                        currentLayoutName={currentLayout.name}
                        onLayoutChange={handleLayoutChange}
                        predefinedPaths={currentLayout.predefinedPaths}
                        trains={simulationState.trains}
                        tracks={simulationState.tracks}
                        onRemoveTrain={handleRemoveTrain}
                        onSelectTrain={handleSelectTrain}
                        selectedTrainId={selectedTrainId}
                    />
                </aside>
            </main>
            {isStopModalVisible && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-down" style={{animationDuration: '0.2s'}}>
                    <div className="bg-slate-800 p-8 rounded-lg shadow-2xl border border-slate-700 w-full max-w-md">
                        <h2 className="text-2xl font-bold text-rose-500 mb-4 flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>Confirm Emergency Stop</span>
                        </h2>
                        <p className="text-slate-300 mb-8">This will immediately stop all moving trains and pause the simulation. Are you sure you want to proceed?</p>
                        <div className="flex justify-end space-x-4">
                            <button onClick={() => setIsStopModalVisible(false)} className="px-5 py-2 rounded-md bg-slate-600 hover:bg-slate-500 text-white font-semibold transition-colors">Cancel</button>
                            <button onClick={handleEmergencyStopConfirm} className="px-5 py-2 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors">Confirm Stop</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;