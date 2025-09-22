import { Layout, Node, Train, TrainType, TrainStatus } from './types';
import { TRAIN_COLORS, TRAIN_PRIORITIES } from './constants';

// Function to calculate distance between two nodes
const getLength = (node1: Node, node2: Node): number => {
    const dx = node2.position.x - node1.position.x;
    const dy = node2.position.y - node1.position.y;
    return Math.sqrt(dx * dx + dy * dy);
};

// --- LAYOUT 1: Delhi-Ghaziabad Corridor ---

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
        path: ['NDLS', 'J_W', 'J_C', 'J_E', 'GZB'], pathIndex: 0, currentTrackId: null, progress: -0.01, speed: 0.015, status: TrainStatus.Moving,
    },
    {
        id: 'train-local-01', name: 'GZB-NDLS Local', type: TrainType.Local, color: TRAIN_COLORS.Local, priority: TRAIN_PRIORITIES.Local,
        path: ['GZB', 'J_E', 'J_C', 'J_W', 'NDLS'], pathIndex: 0, currentTrackId: null, progress: -0.2, speed: 0.01, status: TrainStatus.Moving,
    },
     {
        id: 'train-freight-01', name: 'Goods to GZB', type: TrainType.Freight, color: TRAIN_COLORS.Freight, priority: TRAIN_PRIORITIES.Freight,
        path: ['Yard', 'J_C', 'J_E', 'GZB'], pathIndex: 0, currentTrackId: null, progress: -0.8, speed: 0.008, status: TrainStatus.Moving,
    },
    {
        id: 'train-express-01', name: 'ANVT-NDLS Exp', type: TrainType.Express, color: TRAIN_COLORS.Express, priority: TRAIN_PRIORITIES.Express,
        path: ['ANVT', 'J_C', 'J_W', 'NDLS'], pathIndex: 0, currentTrackId: null, progress: -0.5, speed: 0.012, status: TrainStatus.Moving,
    },
    {
        id: 'train-local-02', name: 'SBB-OKA Local', type: TrainType.Local, color: TRAIN_COLORS.Local, priority: TRAIN_PRIORITIES.Local,
        path: ['SBB', 'J_E', 'J_C', 'J_W', 'OKA'], pathIndex: 0, currentTrackId: null, progress: -1.5, speed: 0.01, status: TrainStatus.Moving,
    },
];

const DELHI_LAYOUT: Layout = {
    name: "Delhi-Ghaziabad Corridor",
    nodes: delhiNodes,
    stations: [
        { ...delhiNodes['NDLS'], name: 'New Delhi' }, { ...delhiNodes['GZB'], name: 'Ghaziabad' }, { ...delhiNodes['ANVT'], name: 'Anand Vihar' },
        { ...delhiNodes['Yard'], name: 'Freight Yard' }, { ...delhiNodes['SBB'], name: 'Sahibabad' }, { ...delhiNodes['OKA'], name: 'Okhla' },
    ],
    tracks: {
        'T_OKA_JW': { id: 'T_OKA_JW', startNode: 'OKA', endNode: 'J_W', length: getLength(delhiNodes['OKA'], delhiNodes['J_W']), occupiedBy: null, conflictsWith: 'T_JW_OKA_rev' },
        'T_JW_OKA_rev': { id: 'T_JW_OKA_rev', startNode: 'J_W', endNode: 'OKA', length: getLength(delhiNodes['J_W'], delhiNodes['OKA']), occupiedBy: null, conflictsWith: 'T_OKA_JW' },
        'T_JW_NDLS': { id: 'T_JW_NDLS', startNode: 'J_W', endNode: 'NDLS', length: getLength(delhiNodes['J_W'], delhiNodes['NDLS']), occupiedBy: null, conflictsWith: 'T_NDLS_JW_rev' },
        'T_NDLS_JW_rev': { id: 'T_NDLS_JW_rev', startNode: 'NDLS', endNode: 'J_W', length: getLength(delhiNodes['NDLS'], delhiNodes['J_W']), occupiedBy: null, conflictsWith: 'T_JW_NDLS' },
       
        // Main Line (Track 1)
        'T_JW_JC_1': { id: 'T_JW_JC_1', startNode: 'J_W', endNode: 'J_C', length: getLength(delhiNodes['J_W'], delhiNodes['J_C']), occupiedBy: null, conflictsWith: 'T_JC_JW_rev_1' },
        'T_JC_JW_rev_1': { id: 'T_JC_JW_rev_1', startNode: 'J_C', endNode: 'J_W', length: getLength(delhiNodes['J_C'], delhiNodes['J_W']), occupiedBy: null, conflictsWith: 'T_JW_JC_1' },
        // Main Line (Track 2 - PARALLEL)
        'T_JW_JC_2': { id: 'T_JW_JC_2', startNode: 'J_W', endNode: 'J_C', length: getLength(delhiNodes['J_W'], delhiNodes['J_C']), occupiedBy: null, conflictsWith: 'T_JC_JW_rev_2' },
        'T_JC_JW_rev_2': { id: 'T_JC_JW_rev_2', startNode: 'J_C', endNode: 'J_W', length: getLength(delhiNodes['J_C'], delhiNodes['J_W']), occupiedBy: null, conflictsWith: 'T_JW_JC_2' },

        'T_JC_JE': { id: 'T_JC_JE', startNode: 'J_C', endNode: 'J_E', length: getLength(delhiNodes['J_C'], delhiNodes['J_E']), occupiedBy: null, conflictsWith: 'T_JE_JC_rev' },
        'T_JE_JC_rev': { id: 'T_JE_JC_rev', startNode: 'J_E', endNode: 'J_C', length: getLength(delhiNodes['J_E'], delhiNodes['J_C']), occupiedBy: null, conflictsWith: 'T_JC_JE' },
        
        'T_ANVT_JC': { id: 'T_ANVT_JC', startNode: 'ANVT', endNode: 'J_C', length: getLength(delhiNodes['ANVT'], delhiNodes['J_C']), occupiedBy: null, conflictsWith: 'T_JC_ANVT_rev' },
        'T_JC_ANVT_rev': { id: 'T_JC_ANVT_rev', startNode: 'J_C', endNode: 'ANVT', length: getLength(delhiNodes['J_C'], delhiNodes['ANVT']), occupiedBy: null, conflictsWith: 'T_ANVT_JC' },
        'T_Yard_JC': { id: 'T_Yard_JC', startNode: 'Yard', endNode: 'J_C', length: getLength(delhiNodes['Yard'], delhiNodes['J_C']), occupiedBy: null, conflictsWith: 'T_JC_Yard_rev' },
        'T_JC_Yard_rev': { id: 'T_JC_Yard_rev', startNode: 'J_C', endNode: 'Yard', length: getLength(delhiNodes['J_C'], delhiNodes['Yard']), occupiedBy: null, conflictsWith: 'T_Yard_JC' },
        'T_JE_GZB': { id: 'T_JE_GZB', startNode: 'J_E', endNode: 'GZB', length: getLength(delhiNodes['J_E'], delhiNodes['GZB']), occupiedBy: null, conflictsWith: 'T_GZB_JE_rev' },
        'T_GZB_JE_rev': { id: 'T_GZB_JE_rev', startNode: 'GZB', endNode: 'J_E', length: getLength(delhiNodes['GZB'], delhiNodes['J_E']), occupiedBy: null, conflictsWith: 'T_JE_GZB' },
        'T_JE_SBB': { id: 'T_JE_SBB', startNode: 'J_E', endNode: 'SBB', length: getLength(delhiNodes['J_E'], delhiNodes['SBB']), occupiedBy: null, conflictsWith: 'T_SBB_JE_rev' },
        'T_SBB_JE_rev': { id: 'T_SBB_JE_rev', startNode: 'SBB', endNode: 'J_E', length: getLength(delhiNodes['SBB'], delhiNodes['J_E']), occupiedBy: null, conflictsWith: 'T_JE_SBB' },
    },
    initialTrains: delhiInitialTrains,
    predefinedPaths: [
        { name: 'New Delhi → Ghaziabad', path: ['NDLS', 'J_W', 'J_C', 'J_E', 'GZB'] }, { name: 'Ghaziabad → New Delhi', path: ['GZB', 'J_E', 'J_C', 'J_W', 'NDLS'] },
        { name: 'Anand Vihar → Ghaziabad', path: ['ANVT', 'J_C', 'J_E', 'GZB'] }, { name: 'Anand Vihar → New Delhi', path: ['ANVT', 'J_C', 'J_W', 'NDLS'] },
        { name: 'Freight Yard → Sahibabad', path: ['Yard', 'J_C', 'J_E', 'SBB'] }, { name: 'New Delhi → Anand Vihar', path: ['NDLS', 'J_W', 'J_C', 'ANVT'] },
        { name: 'Okhla → Ghaziabad', path: ['OKA', 'J_W', 'J_C', 'J_E', 'GZB'] }, { name: 'Sahibabad → New Delhi', path: ['SBB', 'J_E', 'J_C', 'J_W', 'NDLS'] },
        { name: 'Ghaziabad → Okhla', path: ['GZB', 'J_E', 'J_C', 'J_W', 'OKA'] }, { name: 'Anand Vihar → Sahibabad', path: ['ANVT', 'J_C', 'J_E', 'SBB'] },
        { name: 'Okhla → Anand Vihar', path: ['OKA', 'J_W', 'J_C', 'ANVT'] },
    ],
};

// --- LAYOUT 2: Metro Circle Line ---
const metroNodes: Record<string, Node> = {
    'CEN': { id: 'CEN', position: { x: 400, y: 200 } },
    'NTH': { id: 'NTH', position: { x: 400, y: 50 } },
    'EST': { id: 'EST', position: { x: 700, y: 200 } },
    'STH': { id: 'STH', position: { x: 400, y: 350 } },
    'WST': { id: 'WST', position: { x: 100, y: 200 } },
};

const metroInitialTrains: Train[] = [
    {
        id: 'train-local-cw', name: 'Circle CW', type: TrainType.Local, color: TRAIN_COLORS.Local, priority: TRAIN_PRIORITIES.Local,
        path: ['NTH', 'EST', 'STH', 'WST', 'NTH'], pathIndex: 0, currentTrackId: null, progress: -0.01, speed: 0.01, status: TrainStatus.Moving,
    },
    {
        id: 'train-express-acw', name: 'Circle ACW Exp', type: TrainType.Express, color: TRAIN_COLORS.Express, priority: TRAIN_PRIORITIES.Express,
        path: ['NTH', 'WST', 'STH', 'EST', 'NTH'], pathIndex: 0, currentTrackId: null, progress: -0.5, speed: 0.015, status: TrainStatus.Moving,
    },
    {
        id: 'train-shatabdi-hub', name: 'West-Central Shatabdi', type: TrainType.Shatabdi, color: TRAIN_COLORS.Shatabdi, priority: TRAIN_PRIORITIES.Shatabdi,
        path: ['WST', 'CEN', 'EST'], pathIndex: 0, currentTrackId: null, progress: -1.0, speed: 0.012, status: TrainStatus.Moving,
    },
    {
        id: 'train-express-ns', name: 'N-S Express', type: TrainType.Express, color: TRAIN_COLORS.Express, priority: TRAIN_PRIORITIES.Express,
        path: ['NTH', 'CEN', 'STH'], pathIndex: 0, currentTrackId: null, progress: -2.0, speed: 0.015, status: TrainStatus.Moving,
    },
];

const METRO_LAYOUT: Layout = {
    name: "Metro Circle Line",
    nodes: metroNodes,
    stations: [
        { ...metroNodes['CEN'], name: 'Central' }, { ...metroNodes['NTH'], name: 'North' }, { ...metroNodes['EST'], name: 'East' },
        { ...metroNodes['STH'], name: 'South' }, { ...metroNodes['WST'], name: 'West' },
    ],
    tracks: {
        'T_NTH_EST': { id: 'T_NTH_EST', startNode: 'NTH', endNode: 'EST', length: getLength(metroNodes['NTH'], metroNodes['EST']), occupiedBy: null },
        'T_EST_STH': { id: 'T_EST_STH', startNode: 'EST', endNode: 'STH', length: getLength(metroNodes['EST'], metroNodes['STH']), occupiedBy: null },
        'T_STH_WST': { id: 'T_STH_WST', startNode: 'STH', endNode: 'WST', length: getLength(metroNodes['STH'], metroNodes['WST']), occupiedBy: null },
        'T_WST_NTH': { id: 'T_WST_NTH', startNode: 'WST', endNode: 'NTH', length: getLength(metroNodes['WST'], metroNodes['NTH']), occupiedBy: null },
        'T_NTH_WST': { id: 'T_NTH_WST', startNode: 'NTH', endNode: 'WST', length: getLength(metroNodes['NTH'], metroNodes['WST']), occupiedBy: null },
        'T_WST_STH': { id: 'T_WST_STH', startNode: 'WST', endNode: 'STH', length: getLength(metroNodes['WST'], metroNodes['STH']), occupiedBy: null },
        'T_STH_EST': { id: 'T_STH_EST', startNode: 'STH', endNode: 'EST', length: getLength(metroNodes['STH'], metroNodes['EST']), occupiedBy: null },
        'T_EST_NTH': { id: 'T_EST_NTH', startNode: 'EST', endNode: 'NTH', length: getLength(metroNodes['EST'], metroNodes['NTH']), occupiedBy: null },
        'T_NTH_CEN': { id: 'T_NTH_CEN', startNode: 'NTH', endNode: 'CEN', length: getLength(metroNodes['NTH'], metroNodes['CEN']), occupiedBy: null },
        'T_EST_CEN': { id: 'T_EST_CEN', startNode: 'EST', endNode: 'CEN', length: getLength(metroNodes['EST'], metroNodes['CEN']), occupiedBy: null },
        'T_STH_CEN': { id: 'T_STH_CEN', startNode: 'STH', endNode: 'CEN', length: getLength(metroNodes['STH'], metroNodes['CEN']), occupiedBy: null },
        'T_WST_CEN': { id: 'T_WST_CEN', startNode: 'WST', endNode: 'CEN', length: getLength(metroNodes['WST'], metroNodes['CEN']), occupiedBy: null },
        'T_CEN_NTH': { id: 'T_CEN_NTH', startNode: 'CEN', endNode: 'NTH', length: getLength(metroNodes['CEN'], metroNodes['NTH']), occupiedBy: null },
        'T_CEN_EST': { id: 'T_CEN_EST', startNode: 'CEN', endNode: 'EST', length: getLength(metroNodes['CEN'], metroNodes['EST']), occupiedBy: null },
        'T_CEN_STH': { id: 'T_CEN_STH', startNode: 'CEN', endNode: 'STH', length: getLength(metroNodes['CEN'], metroNodes['STH']), occupiedBy: null },
        'T_CEN_WST': { id: 'T_CEN_WST', startNode: 'CEN', endNode: 'WST', length: getLength(metroNodes['CEN'], metroNodes['WST']), occupiedBy: null },
    },
    initialTrains: metroInitialTrains,
    predefinedPaths: [
        { name: 'Circle Clockwise', path: ['NTH', 'EST', 'STH', 'WST', 'NTH'] },
        { name: 'Circle Anti-Clockwise', path: ['NTH', 'WST', 'STH', 'EST', 'NTH'] },
        { name: 'North → South', path: ['NTH', 'CEN', 'STH'] },
        { name: 'East → West', path: ['EST', 'CEN', 'WST'] },
        { name: 'South → North', path: ['STH', 'CEN', 'NTH'] },
        { name: 'West → East', path: ['WST', 'CEN', 'EST'] },
    ],
};

export const LAYOUTS: Layout[] = [DELHI_LAYOUT, METRO_LAYOUT];
