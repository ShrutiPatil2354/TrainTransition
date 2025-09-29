

export enum TrainType {
  Shatabdi = 'Shatabdi',
  Express = 'Express',
  Freight = 'Freight',
  Local = 'Local',
}

export enum TrainStatus {
  Moving = 'MOVING',
  Waiting = 'WAITING',
  Stopped = 'STOPPED', // Used for final destination arrival before removal
}

export interface Train {
  id: string;
  name: string;
  type: TrainType;
  color: string;
  priority: number;
  path: string[]; // Array of Node IDs representing the train's route
  pathIndex: number; // Index for the start node of the next segment in the path
  currentTrackId: string | null;
  progress: number; // 0 to 1 on currentTrackId
  speed: number; // Speed in pixels per second
  status: TrainStatus;
  waitTime: number; // Time spent in WAITING status
  disappearAt: number | null; // Timestamp for when the train should be removed after arrival
  isConflicted: boolean; // Flag to manage conflict logging state
  conflictingTrackIds?: string[] | null; // The track IDs this train is waiting for
  conflictReason?: string | null; // A human-readable reason for the conflict
}

export interface Point {
  x: number;
  y: number;
}

export interface TrackSegment {
  id: string;
  startNode: string;
  endNode: string;
  length: number;
  occupiedBy: string[];
  svgPath?: string; // The SVG path definition for rendering curved tracks
  conflictsWith?: string; // ID of the track running in the opposite direction (for single-line sections)
}

export interface Node {
  id: string;
  position: Point;
}

export interface Station extends Node {
  name: string;
}

export interface SimulationState {
    trains: Train[];
    tracks: Record<string, TrackSegment>;
    nodes: Record<string, Node>;
    stations: Station[];
    time: number;
    isRunning: boolean;
    logs: string[];
    simulationSpeed: number;
}

export interface Layout {
  name: string;
  nodes: Record<string, Node>;
  stations: Station[];
  tracks: Record<string, TrackSegment>;
  initialTrains: Train[];
  predefinedPaths: { name: string; path: string[] }[];
}