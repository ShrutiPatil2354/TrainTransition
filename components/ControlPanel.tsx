

import React, { useState, useEffect } from 'react';
import { TrainType, Node, Train, TrackSegment } from '../types';
import PredictionPanel from './PredictionPanel';

interface ControlPanelProps {
  isRunning: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onEmergencyStop: () => void;
  onSpeedChange: (speed: number) => void;
  simulationSpeed: number;
  logs: string[];
  onAddTrain: (data: { name: string; type: TrainType; path: string[] }) => void;
  onAddTrack: (startNodeId: string, endNodeId: string) => void;
  onAddStation: (data: { name: string; id: string; x: number; y: number; }) => void;
  nodes: Record<string, Node>;
  layouts: { name: string }[];
  currentLayoutName: string;
  onLayoutChange: (name: string) => void;
  predefinedPaths: { name: string; path: string[] }[];
  trains: Train[];
  tracks: Record<string, TrackSegment>;
  onRemoveTrain: (trainId: string) => void;
  onSelectTrain: (trainId: string | null) => void;
  selectedTrainId: string | null;
}

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const PauseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const ResetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120 12M20 20l-1.5-1.5A9 9 0 004 12" /></svg>
);
const WarningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);


const AddTrainForm: React.FC<{ onAddTrain: ControlPanelProps['onAddTrain']; predefinedPaths: ControlPanelProps['predefinedPaths'] }> = ({ onAddTrain, predefinedPaths }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<TrainType>(TrainType.Local);
    const [path, setPath] = useState(JSON.stringify(predefinedPaths[0]?.path || []));

    useEffect(() => {
        setPath(JSON.stringify(predefinedPaths[0]?.path || []));
    }, [predefinedPaths]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!path || path === "[]") return;
        onAddTrain({ name, type, path: JSON.parse(path) });
        setName('');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div>
                <label htmlFor="trainName" className="block text-xs font-medium text-slate-400 mb-1">Train Name (Optional)</label>
                <input type="text" id="trainName" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Morning Express" className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 text-sm focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            <div>
                <label htmlFor="trainType" className="block text-xs font-medium text-slate-400 mb-1">Train Type</label>
                <select id="trainType" value={type} onChange={(e) => setType(e.target.value as TrainType)} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 text-sm focus:ring-cyan-500 focus:border-cyan-500" >
                    {Object.values(TrainType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="trainPath" className="block text-xs font-medium text-slate-400 mb-1">Route</label>
                <select id="trainPath" value={path} onChange={(e) => setPath(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 text-sm focus:ring-cyan-500 focus:border-cyan-500" >
                    {predefinedPaths.map(p => <option key={p.name} value={JSON.stringify(p.path)}>{p.name}</option>)}
                </select>
            </div>
            <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
                Add Train
            </button>
        </form>
    );
}

const AddTrackForm: React.FC<{ onAddTrack: ControlPanelProps['onAddTrack']; nodes: ControlPanelProps['nodes'] }> = ({ onAddTrack, nodes }) => {
    const nodeIds = Object.keys(nodes);
    const [startNode, setStartNode] = useState(nodeIds[0] || '');
    const [endNode, setEndNode] = useState(nodeIds[1] || '');

    useEffect(() => {
        if (!startNode && nodeIds.length > 0) setStartNode(nodeIds[0]);
        if (!endNode && nodeIds.length > 1) setEndNode(nodeIds[1]);
    }, [nodes, nodeIds, startNode, endNode]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!startNode || !endNode) return;
        onAddTrack(startNode, endNode);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex space-x-2">
                <div className="flex-1">
                    <label htmlFor="startNode" className="block text-xs font-medium text-slate-400 mb-1">From</label>
                    <select id="startNode" value={startNode} onChange={(e) => setStartNode(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 text-sm focus:ring-cyan-500 focus:border-cyan-500" >
                        {nodeIds.map(id => <option key={id} value={id}>{id}</option>)}
                    </select>
                </div>
                <div className="flex-1">
                    <label htmlFor="endNode" className="block text-xs font-medium text-slate-400 mb-1">To</label>
                    <select id="endNode" value={endNode} onChange={(e) => setEndNode(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 text-sm focus:ring-cyan-500 focus:border-cyan-500" >
                         {nodeIds.map(id => <option key={id} value={id}>{id}</option>)}
                    </select>
                </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
                Add Track
            </button>
        </form>
    );
}

const AddStationForm: React.FC<{ onAddStation: ControlPanelProps['onAddStation'] }> = ({ onAddStation }) => {
    const [name, setName] = useState('');
    const [id, setId] = useState('');
    const [x, setX] = useState(400);
    const [y, setY] = useState(200);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !id.trim()) return;
        onAddStation({ name, id, x, y });
        setName('');
        setId('');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex space-x-2">
                <div className="flex-1">
                    <label htmlFor="stationName" className="block text-xs font-medium text-slate-400 mb-1">Station Name</label>
                    <input type="text" id="stationName" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Central Park" required className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 text-sm focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
                <div className="w-24">
                    <label htmlFor="stationId" className="block text-xs font-medium text-slate-400 mb-1">ID</label>
                    <input type="text" id="stationId" value={id} onChange={(e) => setId(e.target.value.toUpperCase())} placeholder="e.g. CPK" required maxLength={4} minLength={2} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 text-sm focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
            </div>
            <div className="flex space-x-2">
                <div className="flex-1">
                     <label htmlFor="stationX" className="block text-xs font-medium text-slate-400 mb-1">Position X (0-800)</label>
                     <input type="number" id="stationX" value={x} onChange={(e) => setX(Number(e.target.value))} min="0" max="800" className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 text-sm focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
                <div className="flex-1">
                     <label htmlFor="stationY" className="block text-xs font-medium text-slate-400 mb-1">Position Y (0-400)</label>
                     <input type="number" id="stationY" value={y} onChange={(e) => setY(Number(e.target.value))} min="0" max="400" className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 text-sm focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
                Add Station
            </button>
        </form>
    );
}

const getLogColor = (log: string): string => {
    if (log.includes("🚨")) return 'text-red-400 font-bold';
    if (log.includes("ERROR")) return 'text-red-400';
    if (log.includes("⚠️")) return 'text-amber-400 font-semibold';
    if (log.includes("🤖")) return 'text-sky-400';
    if (log.includes("✅")) return 'text-green-400 font-semibold';
    if (log.includes("🚉")) return 'text-lime-300';
    if (log.includes("proceeds")) return 'text-slate-300';
    return 'text-slate-400';
};


const ControlPanel: React.FC<ControlPanelProps> = (props) => {
    const { 
        isRunning, onPlayPause, onReset, onEmergencyStop, onSpeedChange, simulationSpeed, 
        logs, onAddTrain, onAddTrack, onAddStation, nodes, layouts, 
        currentLayoutName, onLayoutChange, predefinedPaths, trains, tracks, 
        onRemoveTrain, onSelectTrain, selectedTrainId 
    } = props;
    
    const selectedTrain = trains.find(t => t.id === selectedTrainId) || null;

    return (
    <div className="flex flex-col h-full text-slate-300 divide-y divide-slate-700">
        <div className="p-4">
            <button
                onClick={onEmergencyStop}
                className="w-full flex items-center justify-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm shadow-lg shadow-rose-500/20"
            >
                <WarningIcon />
                <span>Emergency Stop</span>
            </button>
        </div>
        <div className="p-4">
            <div className="flex items-center justify-center space-x-4">
                <button onClick={onPlayPause} className="p-3 rounded-full bg-slate-700 hover:bg-cyan-500 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400" aria-label={isRunning ? "Pause simulation" : "Play simulation"}>
                    {isRunning ? <PauseIcon /> : <PlayIcon />}
                </button>
                <button onClick={onReset} className="p-3 rounded-full bg-slate-700 hover:bg-rose-500 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400" aria-label="Reset simulation">
                    <ResetIcon />
                </button>
            </div>
        </div>
        
        <div className="p-4 space-y-3">
            <div>
                <label htmlFor="layout" className="block text-sm font-medium text-slate-400 mb-1">Track Layout</label>
                <select id="layout" value={currentLayoutName} onChange={(e) => onLayoutChange(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-cyan-500 focus:border-cyan-500" >
                    {layouts.map(l => <option key={l.name} value={l.name}>{l.name}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="speed" className="block text-sm font-medium text-slate-400 mb-1">Simulation Speed</label>
                <div className="flex items-center space-x-2">
                    <input id="speed" type="range" min="0.5" max="4" step="0.1" value={simulationSpeed} onChange={(e) => onSpeedChange(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                    <span className="text-sm font-mono w-10 text-center">{simulationSpeed.toFixed(1)}x</span>
                </div>
            </div>
        </div>

        <div className="p-4 flex-shrink-0">
            <h3 className="text-lg font-semibold mb-2 text-cyan-400">Active Trains ({trains.length})</h3>
            <div className="max-h-48 overflow-y-auto bg-slate-900/50 rounded-md p-2 space-y-2">
                {trains.length > 0 ? trains.map(train => (
                    <div 
                        key={train.id}
                        onClick={() => onSelectTrain(train.id === selectedTrainId ? null : train.id)}
                        className={`p-2 rounded-md transition-all duration-200 cursor-pointer ${selectedTrainId === train.id ? 'bg-cyan-800/50 ring-2 ring-cyan-500' : 'bg-slate-800 hover:bg-slate-700/50'}`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 overflow-hidden">
                                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: train.color }}></span>
                                <div className="text-sm">
                                    <p className="font-semibold text-slate-200 truncate">{train.name}</p>
                                    <p className="text-xs text-slate-400 capitalize">
                                        {train.status.toLowerCase()}
                                        {train.waitTime > 0 && (
                                            <span className="text-amber-400 ml-1">
                                                (Waited: {train.waitTime.toFixed(1)}s)
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onRemoveTrain(train.id); }}
                                className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-full hover:bg-rose-500/10 flex-shrink-0"
                                aria-label={`Remove ${train.name}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                         {train.isConflicted && train.conflictReason && (
                            <div className="mt-2 text-xs text-amber-300 border-l-2 border-amber-500/50 ml-1.5 pl-2 py-1 bg-amber-900/20 rounded-r-md">
                                <p><span className="font-semibold text-amber-400">Reason:</span> {train.conflictReason}</p>
                            </div>
                        )}
                    </div>
                )) : (
                    <p className="text-sm text-slate-500 text-center py-4">No active trains.</p>
                )}
            </div>
        </div>

        {selectedTrain && (
            <PredictionPanel
                train={selectedTrain}
                trains={trains}
                tracks={tracks}
                nodes={nodes}
            />
        )}
        
        <div className="p-4">
            <h3 className="text-lg font-semibold mb-2 text-cyan-400">Add New Train</h3>
            <AddTrainForm onAddTrain={onAddTrain} predefinedPaths={predefinedPaths} />
        </div>

        <div className="p-4">
            <h3 className="text-lg font-semibold mb-2 text-cyan-400">Add New Track</h3>
            <AddTrackForm onAddTrack={onAddTrack} nodes={nodes} />
        </div>

        <div className="p-4">
            <h3 className="text-lg font-semibold mb-2 text-cyan-400">Add New Station</h3>
            <AddStationForm onAddStation={onAddStation} />
        </div>

        <div className="p-4">
            <h3 className="text-lg font-semibold mb-2 text-cyan-400">Legend</h3>
            <ul className="space-y-2 text-sm">
                <li className="flex items-center"><span className="w-4 h-4 rounded-full mr-2 bg-rose-500"></span>{TrainType.Shatabdi} / {TrainType.Express} (Highest Prio)</li>
                <li className="flex items-center"><span className="w-4 h-4 rounded-full mr-2 bg-blue-500"></span>{TrainType.Freight} (Medium Prio)</li>
                <li className="flex items-center"><span className="w-4 h-4 rounded-full mr-2 bg-green-500"></span>{TrainType.Local} (Lowest Prio)</li>
                <li className="flex items-center"><span className="w-4 h-4 rounded-full mr-2 bg-amber-500 animate-pulse"></span>Waiting Train</li>
            </ul>
        </div>
        
        <div className="flex-grow p-4 overflow-y-auto flex flex-col min-h-0">
            <h3 className="text-lg font-semibold mb-2 text-cyan-400 sticky top-0 bg-slate-800/70 py-2">Event Log</h3>
            <div className="bg-slate-900 p-2 rounded-md flex-grow overflow-y-auto">
                {logs.map((log, index) => (
                    <p key={index} className={`text-xs font-mono p-1 border-b border-slate-800 last:border-b-0 ${getLogColor(log)}`}>
                        {log}
                    </p>
                ))}
            </div>
        </div>
    </div>
  );
};

export default ControlPanel;