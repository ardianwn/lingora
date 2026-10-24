import { supabase } from './supabase';

export type DashboardProfile = {
  display_name: string | null;
  english_level: string;
  daily_goal_minutes: number;
  target_vocabulary: number;
};

export type DashboardGoal = {
  goal_type: 'minutes' | 'vocabulary' | 'conversation';
  target_value: number;
};

export type DashboardActivity = {
  minutes_learned: number;
  sessions_completed: number;
  reviews_completed: number;
};

export type DashboardData = {
  profile: DashboardProfile;
  goals: DashboardGoal[];
  activity: DashboardActivity | null;
};

export async function getDashboardData(activityDate: string): Promise<DashboardData> {
  const [profileResult, goalsResult, activityResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('display_name, english_level, daily_goal_minutes, target_vocabulary')
      .single(),
    supabase.from('learning_goals').select('goal_type, target_value').eq('active', true),
    supabase
      .from('daily_activity')
      .select('minutes_learned, sessions_completed, reviews_completed')
      .eq('activity_date', activityDate)
      .maybeSingle(),
  ]);

  const error = profileResult.error ?? goalsResult.error ?? activityResult.error;
  if (error) {
    throw error;
  }

  if (!profileResult.data) {
    throw new Error('Profil belajar belum tersedia.');
  }

  return {
    profile: profileResult.data as DashboardProfile,
    goals: (goalsResult.data ?? []) as DashboardGoal[],
    activity: (activityResult.data as DashboardActivity | null) ?? null,
  };
}
