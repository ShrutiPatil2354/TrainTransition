
export enum TrainType {
  Shatabdi = 'Shatabdi',
  Express = 'Express',
  Freight = 'Freight',
  Local = 'Local',
}

export enum TrainStatus {
  Moving = 'MOVING',
  Waiting = 'WAITING',
  Stopped = 'STOPPED',
}

export interface Train {
  id: string;
  name: string;
  type: TrainType;
  color: string;
  priority: number;
  path: string[]; // Node IDs
  pathIndex: number; // Index for the start node of the next segment
  currentTrackId: string | null;
  progress: number; // 0 to 1 on currentTrackId, or <0 for entering, or >=1 for waiting at node
  speed: number;
  status: TrainStatus;
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
  occupiedBy: string | null;
  conflictsWith?: string;
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
