import { supabase } from "@/lib/supabase";

interface TriggerPayload {
  policy_id:     string;
  city:          string;
  rainfall_mm:   number;
  temperature:   number;
  windspeed:     number;
  payout_amount: number;
  trigger_type:  string;
  trigger_value: number;
}

export async function saveTriggerEvent(payload: TriggerPayload) {
  const { data, error } = await supabase
    .from("trigger_events")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}
