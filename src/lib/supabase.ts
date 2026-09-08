import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://oltrxiwdgtevavhbjcdc.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_Ibe6qOxJgQZvCSMlYrPVZg_qwgh6TPo";

export const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
