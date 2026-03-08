import { supabase } from "@/integrations/supabase/client";

export async function remoteDb(action: string, params: Record<string, any> = {}) {
  const { data, error } = await supabase.functions.invoke("remote-db", {
    body: { action, params },
  });

  if (error) throw new Error(error.message || "Edge function error");
  if (data?.error) throw new Error(data.error);
  return data?.data;
}
