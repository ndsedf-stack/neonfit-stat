
export interface RingData {
  value: number;
  max: number;
  label: string;
  colorStart: string;
  colorEnd: string;
  radius: number;
  strokeWidth: number;
  icon?: React.ReactNode;
}

export interface TrackerProps {
  score: number;
  sessions: { current: number; max: number };
  sets: { current: number; max: number };
  status: 'consistent' | 'warning' | 'inactive';
}
