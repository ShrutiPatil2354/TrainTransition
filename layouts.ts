
import { Layout, Node, Train, TrainType, TrainStatus, TrackSegment } from './types';
import { TRAIN_COLORS, TRAIN_PRIORITIES } from './constants';


// --- LAYOUT 1: Mumbai Rail Network (NEW DEFAULT) ---
const mumbaiNodes: Record<string, Node> = {
    'CSMT': { id: 'CSMT', position: { x: 50, y: 150 } },  // Chhatrapati Shivaji Maharaj Terminus
    'PNVL': { id: 'PNVL', position: { x: 50, y: 250 } },  // Panvel
    'DDR':  { id: 'DDR',  position: { x: 400, y: 200 } }, // Dadar
    'TNA':  { id: 'TNA',  position: { x: 750, y: 150 } }, // Thane
    'KYN':  { id: 'KYN',  position: { x: 750, y: 250 } }, // Kalyan
};

const mumbaiTracks: Record<string, TrackSegment> = {
    // CSMT <-> Dadar (2 parallel tracks)
    'T_CSMT_DDR_1': { id: 'T_CSMT_DDR_1', startNode: 'CSMT', endNode: 'DDR', length: 0, occupiedBy: [], svgPath: 'M 50 150 C 200 160, 250 190, 400 200' },
    'T_DDR_CSMT_1': { id: 'T_DDR_CSMT_1', startNode: 'DDR', endNode: 'CSMT', length: 0, occupiedBy: [], svgPath: 'M 400 200 C 250 210, 200 140, 50 150' },
    'T_CSMT_DDR_2': { id: 'T_CSMT_DDR_2', startNode: 'CSMT', endNode: 'DDR', length: 0, occupiedBy: [], svgPath: 'M 50 153 C 200 163, 250 193, 400 203' },
    'T_DDR_CSMT_2': { id: 'T_DDR_CSMT_2', startNode: 'DDR', endNode: 'CSMT', length: 0, occupiedBy: [], svgPath: 'M 400 203 C 250 213, 200 143, 50 153' },

    // Panvel <-> Dadar (2 parallel tracks)
    'T_PNVL_DDR_1': { id: 'T_PNVL_DDR_1', startNode: 'PNVL', endNode: 'DDR', length: 0, occupiedBy: [], svgPath: 'M 50 250 C 200 240, 250 210, 400 200' },
    'T_DDR_PNVL_1': { id: 'T_DDR_PNVL_1', startNode: 'DDR', endNode: 'PNVL', length: 0, occupiedBy: [], svgPath: 'M 400 200 C 250 190, 200 260, 50 250' },
    'T_PNVL_DDR_2': { id: 'T_PNVL_DDR_2', startNode: 'PNVL', endNode: 'DDR', length: 0, occupiedBy: [], svgPath: 'M 50 247 C 200 237, 250 207, 400 197' },
    'T_DDR_PNVL_2': { id: 'T_DDR_PNVL_2', startNode: 'DDR', endNode: 'PNVL', length: 0, occupiedBy: [], svgPath: 'M 400 197 C 250 187, 200 257, 50 247' },

    // Dadar <-> Thane (2 parallel tracks)
    'T_DDR_TNA_1': { id: 'T_DDR_TNA_1', startNode: 'DDR', endNode: 'TNA', length: 0, occupiedBy: [], svgPath: 'M 400 200 C 550 190, 600 140, 750 150' },
    'T_TNA_DDR_1': { id: 'T_TNA_DDR_1', startNode: 'TNA', endNode: 'DDR', length: 0, occupiedBy: [], svgPath: 'M 750 150 C 600 160, 550 210, 400 200' },
    'T_DDR_TNA_2': { id: 'T_DDR_TNA_2', startNode: 'DDR', endNode: 'TNA', length: 0, occupiedBy: [], svgPath: 'M 400 197 C 550 187, 600 137, 750 147' },
    'T_TNA_DDR_2': { id: 'T_TNA_DDR_2', startNode: 'TNA', endNode: 'DDR', length: 0, occupiedBy: [], svgPath: 'M 750 147 C 600 157, 550 207, 400 197' },

    // Dadar <-> Kalyan (2 parallel tracks)
    'T_DDR_KYN_1': { id: 'T_DDR_KYN_1', startNode: 'DDR', endNode: 'KYN', length: 0, occupiedBy: [], svgPath: 'M 400 200 C 550 210, 600 260, 750 250' },
    'T_KYN_DDR_1': { id: 'T_KYN_DDR_1', startNode: 'KYN', endNode: 'DDR', length: 0, occupiedBy: [], svgPath: 'M 750 250 C 600 240, 550 190, 400 200' },
    'T_DDR_KYN_2': { id: 'T_DDR_KYN_2', startNode: 'DDR', endNode: 'KYN', length: 0, occupiedBy: [], svgPath: 'M 400 203 C 550 213, 600 263, 750 253' },
    'T_KYN_DDR_2': { id: 'T_KYN_DDR_2', startNode: 'KYN', endNode: 'DDR', length: 0, occupiedBy: [], svgPath: 'M 750 253 C 600 243, 550 193, 400 203' },
};

const mumbaiInitialTrains: Train[] = [
    {
        id: 'T1-LO', name: 'CSMT-Thane Local', type: TrainType.Local, color: TRAIN_COLORS.Local, priority: TRAIN_PRIORITIES.Local,
        path: ['CSMT', 'DDR', 'TNA'], pathIndex: 0, currentTrackId: null, progress: -0.01, speed: 30, status: TrainStatus.Waiting, waitTime: 0,
        disappearAt: null, isConflicted: false,
    },
    {
        id: 'T2-FR', name: 'Kalyan-Panvel Freight', type: TrainType.Freight, color: TRAIN_COLORS.Freight, priority: TRAIN_PRIORITIES.Freight,
        path: ['KYN', 'DDR', 'PNVL'], pathIndex: 0, currentTrackId: null, progress: -0.1, speed: 20, status: TrainStatus.Waiting, waitTime: 0,
        disappearAt: null, isConflicted: false,
    },
    {
        id: 'T3-EX', name: 'Thane-CSMT Express', type: TrainType.Express, color: TRAIN_COLORS.Express, priority: TRAIN_PRIORITIES.Express,
        path: ['TNA', 'DDR', 'CSMT'], pathIndex: 0, currentTrackId: null, progress: -0.2, speed: 40, status: TrainStatus.Waiting, waitTime: 0,
        disappearAt: null, isConflicted: false,
    },
    {
        id: 'T4-SH', name: 'Panvel-Kalyan Shatabdi', type: TrainType.Shatabdi, color: TRAIN_COLORS.Shatabdi, priority: TRAIN_PRIORITIES.Shatabdi,
        path: ['PNVL', 'DDR', 'KYN'], pathIndex: 0, currentTrackId: null, progress: -0.3, speed: 45, status: TrainStatus.Waiting, waitTime: 0,
        disappearAt: null, isConflicted: false,
    },
];

const MUMBAI_LAYOUT: Layout = {
    name: "Mumbai Rail Network",
    nodes: mumbaiNodes,
    stations: [
        { ...mumbaiNodes['CSMT'], name: 'CSMT' },
        { ...mumbaiNodes['PNVL'], name: 'Panvel' },
        { ...mumbaiNodes['DDR'], name: 'Dadar' },
        { ...mumbaiNodes['TNA'], name: 'Thane' },
        { ...mumbaiNodes['KYN'], name: 'Kalyan' },
    ],
    tracks: mumbaiTracks,
    initialTrains: mumbaiInitialTrains,
    predefinedPaths: [
        { name: 'CSMT → Thane', path: ['CSMT', 'DDR', 'TNA'] },
        { name: 'Thane → CSMT', path: ['TNA', 'DDR', 'CSMT'] },
        { name: 'CSMT → Kalyan', path: ['CSMT', 'DDR', 'KYN'] },
        { name: 'Kalyan → CSMT', path: ['KYN', 'DDR', 'CSMT'] },
        { name: 'Panvel → Thane', path: ['PNVL', 'DDR', 'TNA'] },
        { name: 'Thane → Panvel', path: ['TNA', 'DDR', 'PNVL'] },
        { name: 'Panvel → Kalyan', path: ['PNVL', 'DDR', 'KYN'] },
        { name: 'Kalyan → Panvel', path: ['KYN', 'DDR', 'PNVL'] },
    ],
};


// --- LAYOUT 2: Regional Connector ---
const regionalNodes: Record<string, Node> = {
    'MC': { id: 'MC', position: { x: 400, y: 200 } }, // Metro Center
    'NW': { id: 'NW', position: { x: 400, y: 50 } },  // Northwood
    'SB': { id: 'SB', position: { x: 400, y: 350 } }, // Southbank
    'EG': { id: 'EG', position: { x: 750, y: 200 } }, // Eastgate
    'WM': { id: 'WM', position: { x: 50, y: 200 } },  // Westmere
};

const regionalTracks: Record<string, TrackSegment> = {
    // Westmere <-> Metro Center
    'T_WM_MC_1': { id: 'T_WM_MC_1', startNode: 'WM', endNode: 'MC', length: 0, occupiedBy: [], svgPath: 'M 50 200 C 200 190, 250 190, 400 200' },
    'T_MC_WM_1': { id: 'T_MC_WM_1', startNode: 'MC', endNode: 'WM', length: 0, occupiedBy: [], svgPath: 'M 400 200 C 250 210, 200 210, 50 200' },
    // Eastgate <-> Metro Center
    'T_MC_EG_1': { id: 'T_MC_EG_1', startNode: 'MC', endNode: 'EG', length: 0, occupiedBy: [], svgPath: 'M 400 200 C 550 190, 600 190, 750 200' },
    'T_EG_MC_1': { id: 'T_EG_MC_1', startNode: 'EG', endNode: 'MC', length: 0, occupiedBy: [], svgPath: 'M 750 200 C 600 210, 550 210, 400 200' },
    // Northwood <-> Metro Center
    'T_NW_MC_1': { id: 'T_NW_MC_1', startNode: 'NW', endNode: 'MC', length: 0, occupiedBy: [], svgPath: 'M 400 50 C 390 125, 390 150, 400 200' },
    'T_MC_NW_1': { id: 'T_MC_NW_1', startNode: 'MC', endNode: 'NW', length: 0, occupiedBy: [], svgPath: 'M 400 200 C 410 150, 410 125, 400 50' },
    // Southbank <-> Metro Center
    'T_MC_SB_1': { id: 'T_MC_SB_1', startNode: 'MC', endNode: 'SB', length: 0, occupiedBy: [], svgPath: 'M 400 200 C 390 250, 390 275, 400 350' },
    'T_SB_MC_1': { id: 'T_SB_MC_1', startNode: 'SB', endNode: 'MC', length: 0, occupiedBy: [], svgPath: 'M 400 350 C 410 275, 410 250, 400 200' },
};

const regionalInitialTrains: Train[] = [
    {
        id: 'T1-EX', name: 'East-West Express', type: TrainType.Express, color: TRAIN_COLORS.Express, priority: TRAIN_PRIORITIES.Express,
        path: ['WM', 'MC', 'EG'], pathIndex: 0, currentTrackId: null, progress: -0.01, speed: 40, status: TrainStatus.Waiting, waitTime: 0,
        disappearAt: null, isConflicted: false,
    },
    {
        id: 'T2-LO', name: 'North-South Local', type: TrainType.Local, color: TRAIN_COLORS.Local, priority: TRAIN_PRIORITIES.Local,
        path: ['NW', 'MC', 'SB'], pathIndex: 0, currentTrackId: null, progress: -0.1, speed: 25, status: TrainStatus.Waiting, waitTime: 0,
        disappearAt: null, isConflicted: false,
    },
    {
        id: 'T3-FR', name: 'Industrial Freight', type: TrainType.Freight, color: TRAIN_COLORS.Freight, priority: TRAIN_PRIORITIES.Freight,
        path: ['SB', 'MC', 'WM'], pathIndex: 0, currentTrackId: null, progress: -0.2, speed: 20, status: TrainStatus.Waiting, waitTime: 0,
        disappearAt: null, isConflicted: false,
    },
    {
        id: 'T4-SH', name: 'Metro Shatabdi', type: TrainType.Shatabdi, color: TRAIN_COLORS.Shatabdi, priority: TRAIN_PRIORITIES.Shatabdi,
        path: ['EG', 'MC'], pathIndex: 0, currentTrackId: null, progress: -0.3, speed: 45, status: TrainStatus.Waiting, waitTime: 0,
        disappearAt: null, isConflicted: false,
    },
];

const REGIONAL_LAYOUT: Layout = {
    name: "Regional Connector",
    nodes: regionalNodes,
    stations: [
        { ...regionalNodes['MC'], name: 'Metro Center' }, { ...regionalNodes['NW'], name: 'Northwood' },
        { ...regionalNodes['SB'], name: 'Southbank' }, { ...regionalNodes['EG'], name: 'Eastgate' },
        { ...regionalNodes['WM'], name: 'Westmere' },
    ],
    tracks: regionalTracks,
    initialTrains: regionalInitialTrains,
    predefinedPaths: [
        { name: 'Westmere → Eastgate', path: ['WM', 'MC', 'EG'] },
        { name: 'Eastgate → Westmere', path: ['EG', 'MC', 'WM'] },
        { name: 'Northwood → Southbank', path: ['NW', 'MC', 'SB'] },
        { name: 'Southbank → Northwood', path: ['SB', 'MC', 'NW'] },
        { name: 'Northwood → Eastgate', path: ['NW', 'MC', 'EG'] },
        { name: 'Westmere → Southbank', path: ['WM', 'MC', 'SB'] },
    ],
};


// --- LAYOUT 3: Curved Interchange ---
const interchangeNodes: Record<string, Node> = {
    'N': { id: 'N', position: { x: 400, y: 50 } },   // North Station
    'E': { id: 'E', position: { x: 750, y: 200 } },  // East Station
    'S': { id: 'S', position: { x: 400, y: 350 } },  // South Station
    'W': { id: 'W', position: { x: 50, y: 200 } },   // West Station
};

// FIX: Added `length: 0` to all track segments to satisfy the `TrackSegment` type. The actual length is calculated at runtime when the layout is initialized.
const interchangeTracks: Record<string, TrackSegment> = {
    // West <-> East connections
    'T_W_E_1': { id: 'T_W_E_1', startNode: 'W', endNode: 'E', length: 0, occupiedBy: [], svgPath: 'M 50 200 Q 400 150, 750 200' },
    'T_E_W_1': { id: 'T_E_W_1', startNode: 'E', endNode: 'W', length: 0, occupiedBy: [], svgPath: 'M 750 200 Q 400 250, 50 200' },
    // North <-> South connections
    'T_N_S_1': { id: 'T_N_S_1', startNode: 'N', endNode: 'S', length: 0, occupiedBy: [], svgPath: 'M 400 50 Q 450 200, 400 350' },
    'T_S_N_1': { id: 'T_S_N_1', startNode: 'S', endNode: 'N', length: 0, occupiedBy: [], svgPath: 'M 400 350 Q 350 200, 400 50' },
    // Outer Loops
    'T_W_N_1': { id: 'T_W_N_1', startNode: 'W', endNode: 'N', length: 0, occupiedBy: [], svgPath: 'M 50 200 C 50 50, 200 50, 400 50' },
    'T_N_E_1': { id: 'T_N_E_1', startNode: 'N', endNode: 'E', length: 0, occupiedBy: [], svgPath: 'M 400 50 C 600 50, 750 50, 750 200' },
    'T_E_S_1': { id: 'T_E_S_1', startNode: 'E', endNode: 'S', length: 0, occupiedBy: [], svgPath: 'M 750 200 C 750 350, 600 350, 400 350' },
    'T_S_W_1': { id: 'T_S_W_1', startNode: 'S', endNode: 'W', length: 0, occupiedBy: [], svgPath: 'M 400 350 C 200 350, 50 350, 50 200' },
     // Reverse Outer Loops
    'T_N_W_1': { id: 'T_N_W_1', startNode: 'N', endNode: 'W', length: 0, occupiedBy: [], svgPath: 'M 400 50 C 200 50, 50 50, 50 200' },
    'T_E_N_1': { id: 'T_E_N_1', startNode: 'E', endNode: 'N', length: 0, occupiedBy: [], svgPath: 'M 750 200 C 750 50, 600 50, 400 50' },
    'T_S_E_1': { id: 'T_S_E_1', startNode: 'S', endNode: 'E', length: 0, occupiedBy: [], svgPath: 'M 400 350 C 600 350, 750 350, 750 200' },
    'T_W_S_1': { id: 'T_W_S_1', startNode: 'W', endNode: 'S', length: 0, occupiedBy: [], svgPath: 'M 50 200 C 50 350, 200 350, 400 350' },
};

const interchangeInitialTrains: Train[] = [
    {
        id: 'T1-SH', name: 'Northbound Shatabdi', type: TrainType.Shatabdi, color: TRAIN_COLORS.Shatabdi, priority: TRAIN_PRIORITIES.Shatabdi,
        path: ['S', 'N'], pathIndex: 0, currentTrackId: null, progress: -0.01, speed: 40, status: TrainStatus.Waiting, waitTime: 0,
        disappearAt: null, isConflicted: false,
    },
    {
        id: 'T2-EX', name: 'Eastbound Express', type: TrainType.Express, color: TRAIN_COLORS.Express, priority: TRAIN_PRIORITIES.Express,
        path: ['W', 'E'], pathIndex: 0, currentTrackId: null, progress: -0.1, speed: 35, status: TrainStatus.Waiting, waitTime: 0,
        disappearAt: null, isConflicted: false,
    },
    {
        id: 'T3-FR', name: 'Westbound Freight', type: TrainType.Freight, color: TRAIN_COLORS.Freight, priority: TRAIN_PRIORITIES.Freight,
        path: ['E', 'W'], pathIndex: 0, currentTrackId: null, progress: -0.2, speed: 20, status: TrainStatus.Waiting, waitTime: 0,
        disappearAt: null, isConflicted: false,
    },
    {
        id: 'T4-LO', name: 'Outer Loop Local', type: TrainType.Local, color: TRAIN_COLORS.Local, priority: TRAIN_PRIORITIES.Local,
        path: ['N', 'E', 'S', 'W', 'N'], pathIndex: 0, currentTrackId: null, progress: -0.3, speed: 25, status: TrainStatus.Waiting, waitTime: 0,
        disappearAt: null, isConflicted: false,
    },
];

const INTERCHANGE_LAYOUT: Layout = {
    name: "Curved Interchange",
    nodes: interchangeNodes,
    stations: [
        { ...interchangeNodes['N'], name: 'North' }, { ...interchangeNodes['E'], name: 'East' },
        { ...interchangeNodes['S'], name: 'South' }, { ...interchangeNodes['W'], name: 'West' },
    ],
    tracks: interchangeTracks,
    initialTrains: interchangeInitialTrains,
    predefinedPaths: [
        { name: 'West → East', path: ['W', 'E'] }, { name: 'East → West', path: ['E', 'W'] },
        { name: 'North → South', path: ['N', 'S'] }, { name: 'South → North', path: ['S', 'N'] },
        { name: 'Clockwise Loop', path: ['N', 'E', 'S', 'W', 'N'] },
        { name: 'Counter-Clockwise Loop', path: ['N', 'W', 'S', 'E', 'N'] },
    ],
};


// --- LAYOUT 4: Conflict Demo ---
const demoNodes: Record<string, Node> = {
    'A': { id: 'A', position: { x: 100, y: 200 } },
    'B': { id: 'B', position: { x: 700, y: 200 } },
};

const demoInitialTrains: Train[] = [
    {
        id: 'T1-SH', name: 'Superfast Exp', type: TrainType.Shatabdi, color: TRAIN_COLORS.Shatabdi, priority: TRAIN_PRIORITIES.Shatabdi,
        path: ['A', 'B'], pathIndex: 0, currentTrackId: null, progress: -0.01, speed: 40, status: TrainStatus.Waiting, waitTime: 0,
        disappearAt: null, isConflicted: false,
    },
    {
        id: 'T2-EX', name: 'Capital Exp', type: TrainType.Express, color: TRAIN_COLORS.Express, priority: TRAIN_PRIORITIES.Express,
        path: ['A', 'B'], pathIndex: 0, currentTrackId: null, progress: -0.1, speed: 35, status: TrainStatus.Waiting, waitTime: 0,
        disappearAt: null, isConflicted: false,
    },
    {
        id: 'T3-FR', name: 'Goods Carrier', type: TrainType.Freight, color: TRAIN_COLORS.Freight, priority: TRAIN_PRIORITIES.Freight,
        path: ['A', 'B'], pathIndex: 0, currentTrackId: null, progress: -0.2, speed: 20, status: TrainStatus.Waiting, waitTime: 0,
        disappearAt: null, isConflicted: false,
    },
    {
        id: 'T4-LO', name: 'City Local', type: TrainType.Local, color: TRAIN_COLORS.Local, priority: TRAIN_PRIORITIES.Local,
        path: ['A', 'B'], pathIndex: 0, currentTrackId: null, progress: -0.3, speed: 25, status: TrainStatus.Waiting, waitTime: 0,
        disappearAt: null, isConflicted: false,
    },
];

const DEMO_LAYOUT: Layout = {
    name: "Conflict Demo",
    nodes: demoNodes,
    stations: [
        { ...demoNodes['A'], name: 'Station A' },
        { ...demoNodes['B'], name: 'Station B' },
    ],
    // FIX: Added `length: 0` to all track segments to satisfy the `TrackSegment` type. The actual length is calculated at runtime when the layout is initialized.
    tracks: {
        'T_A_B_1': { id: 'T_A_B_1', startNode: 'A', endNode: 'B', length: 0, occupiedBy: [], svgPath: 'M 100 200 L 700 200' },
        'T_A_B_2': { id: 'T_A_B_2', startNode: 'A', endNode: 'B', length: 0, occupiedBy: [], svgPath: 'M 100 204 L 700 204' },
        'T_B_A_1': { id: 'T_B_A_1', startNode: 'B', endNode: 'A', length: 0, occupiedBy: [], svgPath: 'M 700 196 L 100 196' },
    },
    initialTrains: demoInitialTrains,
    predefinedPaths: [
        { name: 'Station A → Station B', path: ['A', 'B'] },
        { name: 'Station B → Station A', path: ['B', 'A'] },
    ],
};


// --- LAYOUT 5: Delhi-Ghaziabad Corridor ---

const delhiNodes: Record<string, Node> = {
    'NDLS': { id: 'NDLS', position: { x: 150, y: 200 } },  // New Delhi
    'GZB':  { id: 'GZB', position: { x: 650, y: 200 } },  // Ghaziabad
    'ANVT': { id: 'ANVT', position: { x: 400, y: 50 } },   // Anand Vihar
    'Yard': { id: 'Yard', position: { x: 400, y: 350 } }, // Freight Yard
    'SBB':  { id: 'SBB', position: { x: 750, y: 100 } },  // Sahibabad
    'OKA':  { id: 'OKA', position: { x: 50, y: 300 } },   // Okhla
    'J_W': { id: 'J_W', position: { x: 250, y: 200 } }, // West Junction (near NDLS/OKA)
    'J_C': { id: 'J_C', position: { x: 400, y: 200 } }, // Central Junction
    'J_E': { id: 'J_E', position: { x: 550, y: 200 } }, // East Junction (near GZB/SBB)
};

const delhiInitialTrains: Train[] = [
    {
        id: 'train-shatabdi-01', name: 'NDLS-GZB Shatabdi', type: TrainType.Shatabdi, color: TRAIN_COLORS.Shatabdi, priority: TRAIN_PRIORITIES.Shatabdi,
        path: ['NDLS', 'J_W', 'J_C', 'J_E', 'GZB'], pathIndex: 0, currentTrackId: null, progress: -0.01, speed: 40, status: TrainStatus.Waiting, waitTime: 0,
        disappearAt: null, isConflicted: false,
    },
    {
        id: 'train-local-01', name: 'GZB-NDLS Local', type: TrainType.Local, color: TRAIN_COLORS.Local, priority: TRAIN_PRIORITIES.Local,
        path: ['GZB', 'J_E', 'J_C', 'J_W', 'NDLS'], pathIndex: 0, currentTrackId: null, progress: -0.2, speed: 25, status: TrainStatus.Waiting, waitTime: 0,
        disappearAt: null, isConflicted: false,
    },
     {
        id: 'train-freight-01', name: 'Goods to GZB', type: TrainType.Freight, color: TRAIN_COLORS.Freight, priority: TRAIN_PRIORITIES.Freight,
        path: ['Yard', 'J_C', 'J_E', 'GZB'], pathIndex: 0, currentTrackId: null, progress: -0.8, speed: 20, status: TrainStatus.Waiting, waitTime: 0,
        disappearAt: null, isConflicted: false,
    },
    {
        id: 'train-express-01', name: 'ANVT-NDLS Exp', type: TrainType.Express, color: TRAIN_COLORS.Express, priority: TRAIN_PRIORITIES.Express,
        path: ['ANVT', 'J_C', 'J_W', 'NDLS'], pathIndex: 0, currentTrackId: null, progress: -0.5, speed: 35, status: TrainStatus.Waiting, waitTime: 0,
        disappearAt: null, isConflicted: false,
    },
    {
        id: 'train-local-02', name: 'SBB-OKA Local', type: TrainType.Local, color: TRAIN_COLORS.Local, priority: TRAIN_PRIORITIES.Local,
        path: ['SBB', 'J_E', 'J_C', 'J_W', 'OKA'], pathIndex: 0, currentTrackId: null, progress: -1.5, speed: 25, status: TrainStatus.Waiting, waitTime: 0,
        disappearAt: null, isConflicted: false,
    },
];

const DELHI_LAYOUT: Layout = {
    name: "Delhi-Ghaziabad Corridor",
    nodes: delhiNodes,
    stations: [
        { ...delhiNodes['NDLS'], name: 'New Delhi' }, { ...delhiNodes['GZB'], name: 'Ghaziabad' }, { ...delhiNodes['ANVT'], name: 'Anand Vihar' },
        { ...delhiNodes['Yard'], name: 'Freight Yard' }, { ...delhiNodes['SBB'], name: 'Sahibabad' }, { ...delhiNodes['OKA'], name: 'Okhla' },
    ],
    // FIX: Added `length: 0` to all track segments to satisfy the `TrackSegment` type. The actual length is calculated at runtime when the layout is initialized.
    tracks: {
        'T_OKA_JW': { id: 'T_OKA_JW', startNode: 'OKA', endNode: 'J_W', length: 0, occupiedBy: [], conflictsWith: 'T_JW_OKA_rev' },
        'T_JW_OKA_rev': { id: 'T_JW_OKA_rev', startNode: 'J_W', endNode: 'OKA', length: 0, occupiedBy: [], conflictsWith: 'T_OKA_JW' },
        'T_JW_NDLS': { id: 'T_JW_NDLS', startNode: 'J_W', endNode: 'NDLS', length: 0, occupiedBy: [], conflictsWith: 'T_NDLS_JW_rev' },
        'T_NDLS_JW_rev': { id: 'T_NDLS_JW_rev', startNode: 'NDLS', endNode: 'J_W', length: 0, occupiedBy: [], conflictsWith: 'T_JW_NDLS' },
       
        'T_JW_JC_1': { id: 'T_JW_JC_1', startNode: 'J_W', endNode: 'J_C', length: 0, occupiedBy: [], svgPath: 'M 250 200 L 400 200' },
        'T_JC_JW_1': { id: 'T_JC_JW_1', startNode: 'J_C', endNode: 'J_W', length: 0, occupiedBy: [], svgPath: 'M 400 204 L 250 204' },
        'T_JW_JC_2': { id: 'T_JW_JC_2', startNode: 'J_W', endNode: 'J_C', length: 0, occupiedBy: [], svgPath: 'M 250 196 L 400 196' },
        'T_JC_JW_2': { id: 'T_JC_JW_2', startNode: 'J_C', endNode: 'J_W', length: 0, occupiedBy: [], svgPath: 'M 400 200 L 250 200' },

        'T_JC_JE_1': { id: 'T_JC_JE_1', startNode: 'J_C', endNode: 'J_E', length: 0, occupiedBy: [] },
        'T_JE_JC_1': { id: 'T_JE_JC_1', startNode: 'J_E', endNode: 'J_C', length: 0, occupiedBy: [] },
        
        'T_ANVT_JC': { id: 'T_ANVT_JC', startNode: 'ANVT', endNode: 'J_C', length: 0, occupiedBy: [], conflictsWith: 'T_JC_ANVT_rev' },
        'T_JC_ANVT_rev': { id: 'T_JC_ANVT_rev', startNode: 'J_C', endNode: 'ANVT', length: 0, occupiedBy: [], conflictsWith: 'T_ANVT_JC' },
        'T_Yard_JC': { id: 'T_Yard_JC', startNode: 'Yard', endNode: 'J_C', length: 0, occupiedBy: [], conflictsWith: 'T_JC_Yard_rev' },
        'T_JC_Yard_rev': { id: 'T_JC_Yard_rev', startNode: 'J_C', endNode: 'Yard', length: 0, occupiedBy: [], conflictsWith: 'T_Yard_JC' },
        'T_JE_GZB': { id: 'T_JE_GZB', startNode: 'J_E', endNode: 'GZB', length: 0, occupiedBy: [], conflictsWith: 'T_GZB_JE_rev' },
        'T_GZB_JE_rev': { id: 'T_GZB_JE_rev', startNode: 'GZB', endNode: 'J_E', length: 0, occupiedBy: [], conflictsWith: 'T_JE_GZB' },
        'T_JE_SBB': { id: 'T_JE_SBB', startNode: 'J_E', endNode: 'SBB', length: 0, occupiedBy: [], conflictsWith: 'T_SBB_JE_rev' },
        'T_SBB_JE_rev': { id: 'T_SBB_JE_rev', startNode: 'SBB', endNode: 'J_E', length: 0, occupiedBy: [], conflictsWith: 'T_JE_SBB' },
    },
    initialTrains: delhiInitialTrains,
    predefinedPaths: [
        { name: 'New Delhi → Ghaziabad', path: ['NDLS', 'J_W', 'J_C', 'J_E', 'GZB'] }, { name: 'Ghaziabad → New Delhi', path: ['GZB', 'J_E', 'J_C', 'J_W', 'NDLS'] },
        { name: 'Anand Vihar → Ghaziab.', path: ['ANVT', 'J_C', 'J_E', 'GZB'] }, { name: 'Anand Vihar → New Delhi', path: ['ANVT', 'J_C', 'J_W', 'NDLS'] },
        { name: 'Freight Yard → Sahibab.', path: ['Yard', 'J_C', 'J_E', 'SBB'] }, { name: 'New Delhi → Anand Vihar', path: ['NDLS', 'J_W', 'J_C', 'ANVT'] },
        { name: 'Okhla → Ghaziabad', path: ['OKA', 'J_W', 'J_C', 'J_E', 'GZB'] }, { name: 'Sahibabad → New Delhi', path: ['SBB', 'J_E', 'J_C', 'J_W', 'NDLS'] },
        { name: 'Ghaziabad → Okhla', path: ['GZB', 'J_E', 'J_C', 'J_W', 'OKA'] }, { name: 'Anand Vihar → Sahibab.', path: ['ANVT', 'J_C', 'J_E', 'SBB'] },
        { name: 'Okhla → Anand Vihar', path: ['OKA', 'J_W', 'J_C', 'ANVT'] },
    ],
};


export const LAYOUTS: Layout[] = [MUMBAI_LAYOUT, REGIONAL_LAYOUT, INTERCHANGE_LAYOUT, DEMO_LAYOUT, DELHI_LAYOUT];
