import { motion } from "framer-motion";
import { AlertTriangle, Info, XCircle } from "lucide-react";

const severityConfig = {
  high: {
    icon: <XCircle size={16} />,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    label: "High",
  },
  medium: {
    icon: <AlertTriangle size={16} />,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    label: "Medium",
  },
  low: {
    icon: <Info size={16} />,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    label: "Low",
  },
};

export default function SuggestionCard({ suggestions = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="p-5 rounded-2xl bg-white/5 border border-white/10"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">💡</span>
        <h3 className="font-semibold text-white">Suggestions</h3>
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
          {suggestions.length} found
        </span>
      </div>

      <ul className="space-y-3">
        {suggestions.map((s, i) => {
          const config = severityConfig[s.severity || "low"];
          return (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              className={`flex items-start gap-3 p-3 rounded-xl border ${config.bg} ${config.border}`}
            >
              <span className={`mt-0.5 flex-shrink-0 ${config.color}`}>
                {config.icon}
              </span>
              <div>
                <span className={`text-xs font-semibold ${config.color} uppercase tracking-wider`}>
                  {config.label}
                </span>
                <p className="text-gray-300 text-sm mt-0.5">{s.text || s}</p>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </motion.div>
  );
}