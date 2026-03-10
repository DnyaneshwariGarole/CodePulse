import { motion } from "framer-motion";

const statusStyles = {
  good: {
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    text: "text-green-400",
    dot: "bg-green-400",
    glow: "#00ff88",
  },
  warning: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    text: "text-yellow-400",
    dot: "bg-yellow-400",
    glow: "#fbbf24",
  },
  error: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
    dot: "bg-red-400",
    glow: "#ef4444",
  },
};

export default function MetricCard({ icon, label, value, status = "good", delay = 0 }) {
  const styles = statusStyles[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -3, scale: 1.02 }}
      className={`p-4 rounded-xl border ${styles.bg} ${styles.border} cursor-default`}
      style={{ boxShadow: `0 4px 20px ${styles.glow}10` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${styles.dot} animate-pulse`} />
          <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">
            {label}
          </span>
        </div>
        <span className={`text-lg ${styles.text}`}>{icon}</span>
      </div>
      <p className={`font-semibold text-sm ${styles.text}`}>{value}</p>
    </motion.div>
  );
}