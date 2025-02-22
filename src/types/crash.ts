
export type CrashGame = {
  id: string;
  started_at: string;
  completed_at: string | null;
  crash_point: number | null;
  status: 'waiting' | 'running' | 'completed';
};

export type CrashBet = {
  id: string;
  user_id: string;
  game_id: string;
  amount: number;
  cashout_multiplier: number | null;
  created_at: string;
  cashed_out_at: string | null;
  status: 'active' | 'won' | 'lost';
  won_amount: number | null;
};
