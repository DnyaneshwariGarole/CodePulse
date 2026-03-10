import { motion } from "framer-motion";

const gradeColors = {
  "A+": "#00ff88",
  A: "#00e676",
  "B+": "#6366f1",
  B: "#818cf8",
  "C+": "#f59e0b",
  C: "#fbbf24",
  D: "#ef4444",
};

export default function ScoreCard({ score, grade }) {
  const color = gradeColors[grade] || "#6366f1";
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-6"
      style={{ boxShadow: `0 0 30px ${color}15` }}
    >
      {/* Circular Progress */}
      <div className="relative w-28 h-28 flex-shrink-0">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#1f2937" strokeWidth="8" />
          <motion.circle
            cx="50" cy="50" r="40"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold text-white"
          >
            {score}
          </motion.span>
          <span className="text-xs text-gray-500">/ 100</span>
        </div>
      </div>

      {/* Info */}
      <div>
        <p className="text-gray-400 text-sm mb-2">Productivity Score</p>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="inline-block px-5 py-2 rounded-xl text-2xl font-bold mb-2"
          style={{
            background: `linear-gradient(135deg, ${color}22, ${color}44)`,
            border: `1px solid ${color}55`,
            color: color,
            textShadow: `0 0 20px ${color}`,
          }}
        >
          {grade}
        </motion.div>
        <p className="text-gray-400 text-sm">
          {score >= 80
            ? "Excellent code quality! 🏆"
            : score >= 60
            ? "Good, minor improvements needed 👍"
            : "Needs significant improvement ⚠️"}
        </p>
      </div>
    </motion.div>
  );
}