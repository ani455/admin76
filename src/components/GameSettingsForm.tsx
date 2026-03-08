import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Save } from "lucide-react";
import { toast } from "sonner";

export default function GameSettingsForm() {
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ["game-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("game_settings").select("*").eq("id", 1).single();
      if (error) throw error;
      return data;
    },
  });

  const [gameMode, setGameMode] = useState("");
  const [processType, setProcessType] = useState("");

  // Sync state when data loads
  const currentMode = gameMode || settings?.game_mode || "wingo";
  const currentProcess = processType || settings?.process_type || "highest_bet_wins";

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("game_settings").update({
        game_mode: currentMode,
        process_type: currentProcess,
      }).eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings saved!");
      queryClient.invalidateQueries({ queryKey: ["game-settings"] });
    },
    onError: () => toast.error("Failed to save settings"),
  });

  return (
    <div className="bg-card rounded-xl border p-6 animate-slide-up" style={{ animationDelay: "600ms" }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "hsl(var(--stat-indigo) / 0.1)" }}>
          <Settings className="w-5 h-5" style={{ color: "hsl(var(--stat-indigo))" }} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-card-foreground">Game Settings</h3>
          <p className="text-sm text-muted-foreground">Configure game mode and win process</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-card-foreground mb-2">Game Mode</label>
          <select value={currentMode} onChange={(e) => setGameMode(e.target.value)} className="w-full h-11 rounded-lg bg-secondary text-secondary-foreground border-0 px-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none transition-all">
            <option value="wingo">WinGo</option>
            <option value="k3">K3</option>
            <option value="5d">5D</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-card-foreground mb-2">Process Type</label>
          <select value={currentProcess} onChange={(e) => setProcessType(e.target.value)} className="w-full h-11 rounded-lg bg-secondary text-secondary-foreground border-0 px-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none transition-all">
            <option value="highest_bet_wins">Higher Bet Wins</option>
            <option value="random">Random</option>
            <option value="default">Higher Bet Lose</option>
          </select>
        </div>
      </div>
      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
          mutation.isPending ? "opacity-70" : "bg-primary text-primary-foreground hover:opacity-90 hover:scale-[1.02]"
        }`}
        style={{ background: mutation.isSuccess ? "hsl(var(--stat-green))" : undefined }}
      >
        <Save className="w-4 h-4" />
        {mutation.isPending ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
