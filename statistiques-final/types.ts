export interface DailyStat {
  day: string;
  calories: number;
  workoutMinutes: number;
  steps: number;
}

export interface UserProfile {
  name: string;
  level: string;
  streak: number;
  weight: number; // kg
  goalWeight: number; // kg
  heartRate: number; // bpm
  sleepScore: number; // 0-100
  hydration: number; // % of daily goal
}

export interface DashboardData {
  weeklyStats: DailyStat[];
  user: UserProfile;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface TrackerProps {
  score: number;
  sessions: {
    current: number;
    max: number;
  };
  sets: {
    current: number;
    max: number;
  };
  status: 'consistent' | 'warning';
}
