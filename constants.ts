import { TrainType } from './types';

// Define the priority levels for each train type
export const TRAIN_PRIORITIES: Record<TrainType, number> = {
  [TrainType.Shatabdi]: 3,
  [TrainType.Express]: 3,
  [TrainType.Freight]: 2,
  [TrainType.Local]: 1,
};

// Define the colors for each train type
export const TRAIN_COLORS: Record<TrainType, string> = {
  [TrainType.Shatabdi]: '#f43f5e', // rose-500
  [TrainType.Express]: '#ec4899', // pink-500
  [TrainType.Freight]: '#3b82f6', // blue-500
  [TrainType.Local]: '#22c55e', // green-500
};
