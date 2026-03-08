import { useState } from "react";
import { Settings, Save } from "lucide-react";

export default function GameSettingsForm() {
  const [gameMode, setGameMode] = useState("wingo");
  const [processType, setProcessType] = useState("highest_bet_wins");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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
          <select
            value={gameMode}
            onChange={(e) => setGameMode(e.target.value)}
            className="w-full h-11 rounded-lg bg-secondary text-secondary-foreground border-0 px-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none transition-all"
          >
            <option value="wingo">WinGo</option>
            <option value="k3">K3</option>
            <option value="5d">5D</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-card-foreground mb-2">Process Type</label>
          <select
            value={processType}
            onChange={(e) => setProcessType(e.target.value)}
            className="w-full h-11 rounded-lg bg-secondary text-secondary-foreground border-0 px-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none transition-all"
          >
            <option value="highest_bet_wins">Higher Bet Wins</option>
            <option value="random">Random</option>
            <option value="default">Higher Bet Lose</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleSave}
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
          saved
            ? "bg-[hsl(var(--stat-green))] text-primary-foreground scale-105"
            : "bg-primary text-primary-foreground hover:opacity-90 hover:scale-[1.02]"
        }`}
      >
        <Save className="w-4 h-4" />
        {saved ? "Saved!" : "Save Settings"}
      </button>
    </div>
  );
}
