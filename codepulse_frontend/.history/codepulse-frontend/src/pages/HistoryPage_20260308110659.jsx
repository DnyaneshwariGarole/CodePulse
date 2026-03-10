import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Clock, Code2, TrendingUp, Filter, Eye } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const dummyHistory = [
  { id: 1, language: "Java", score: 85, grade: "A", date: "2024-03-01", lines: 120, file: "UserService.java" },
  { id: 2, language: "JavaScript", score: 62, grade: "C+", date: "2024-03-03", lines: 80, file: "app.js" },
  { id: 3, language: "Python", score: 91, grade: "A+", date: "2024-03-05", lines: 200, file: "main.py" },
  { id: 4, language: "Java", score: 74, grade: "B", date: "2024-03-06", lines: 95, file: "Controller.java" },
  { id: 5, language: "C++", score: 55, grade: "D", date: "2024-03-07", lines: 150, file: "sorting.cpp" },
  { id: 6, language: "Java", score: 88, grade: "A", date: "2024-03-08", lines: 110, file: "Repository.java" },
];

const chartData = dummyHistory.map((h) => ({
  date: h.date.slice(5),
  score: h.score,
}));

const gradeColor = {
  "A+": "#00ff88", A: "#00e676", "B+": "#6366f1",
  B: "#818cf8", "C+": "#f59e0b", C: "#fbbf24", D: "#ef4444",
};

const langColor = {
  Java: "#f59e0b", JavaScript: "#60a5fa",
  Python: "#34d399", "C++": "#f87171",
};

export default function HistoryPage() {
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  const languages = ["All", ...new Set(dummyHistory.map((h) => h.language))];
  const filtered = filter === "All" ? dummyHistory : dummyHistory.filter((h) => h.language === filter);

  const avgScore = Math.round(dummyHistory.reduce((a, b) => a + b.score, 0) / dummyHistory.length);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <div className="pt-24 px-6 pb-10 max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-1">
            Analysis{" "}
            <span className="bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
              History
            </span>
          </h1>
          <p className="text-gray-500">Track your code quality over time</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: <Code2 size={20} className="text-purple-400" />, label: "Total Analyses", value: dummyHistory.length },
            { icon: <TrendingUp size={20} className="text-green-400" />, label: "Average Score", value: `${avgScore}/100` },
            { icon: <Clock size={20} className="text-blue-400" />, label: "Last Analyzed", value: "Today" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                {stat.icon}
              </div>
              <div>
                <p className="text-gray-500 text-xs">{stat.label}</p>
                <p className="text-white font-bold text-xl">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-8"
        >
          <h3 className="text-white font-semibold mb-4">📈 Score Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" stroke="#374151" tick={{ fill: "#6b7280", fontSize: 12 }} />
              <YAxis domain={[0, 100]} stroke="#374151" tick={{ fill: "#6b7280", fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, color: "#fff" }}
              />
              <Line
                type="monotone" dataKey="score" stroke="#6366f1"
                strokeWidth={2.5} dot={{ fill: "#6366f1", r: 4 }}
                activeDot={{ r: 6, fill: "#00ff88" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Filter */}
        <div className="flex items-center gap-3 mb-5">
          <Filter size={16} className="text-gray-500" />
          <div className="flex gap-2 flex-wrap">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setFilter(lang)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filter === lang
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                    : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* History Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                {["File", "Language", "Lines", "Score", "Grade", "Date", ""].map((h) => (
                  <th key={h} className="text-left text-xs text-gray-500 uppercase tracking-wider px-5 py-4 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-5 py-4 text-white text-sm font-medium">{item.file}</td>
                  <td className="px-5 py-4">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{
                        background: `${langColor[item.language]}20`,
                        color: langColor[item.language],
                        border: `1px solid ${langColor[item.language]}40`,
                      }}
                    >
                      {item.language}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-sm">{item.lines}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${item.score}%`,
                            background: gradeColor[item.grade],
                          }}
                        />
                      </div>
                      <span className="text-white text-sm font-medium">{item.score}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="px-2.5 py-1 rounded-lg text-sm font-bold"
                      style={{
                        color: gradeColor[item.grade],
                        background: `${gradeColor[item.grade]}15`,
                      }}
                    >
                      {item.grade}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-sm">{item.date}</td>
                  <td className="px-5 py-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => navigate("/analyzer")}
                      className="p-2 rounded-lg bg-white/5 hover:bg-purple-500/20 text-gray-400 hover:text-purple-400 transition-all"
                    >
                      <Eye size={15} />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  );
}