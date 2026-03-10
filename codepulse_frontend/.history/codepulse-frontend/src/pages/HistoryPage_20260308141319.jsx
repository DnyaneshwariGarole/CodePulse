import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Clock, Code2, TrendingUp, Filter } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import API from "../api";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get("/api/code/history");
        setHistory(res.data);
      } catch (err) {
        console.error("History fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const languages = ["All", ...new Set(history.map((h) => h.language || "Unknown"))];
  const filtered = filter === "All" ? history : history.filter((h) => h.language === filter);

  const avgScore = history.length
    ? Math.round(history.reduce((a, b) => a + (b.productivityScore || 0), 0) / history.length)
    : 0;

  const chartData = history.map((h, i) => ({
    index: i + 1,
    score: h.productivityScore || 0,
  }));

  const getGrade = (score) => {
    if (score >= 90) return "A+";
    if (score >= 80) return "A";
    if (score >= 70) return "B+";
    if (score >= 60) return "B";
    if (score >= 50) return "C";
    return "D";
  };

  const gradeColor = {
    "A+": "#00ff88", A: "#00e676", "B+": "#6366f1",
    B: "#818cf8", "C+": "#f59e0b", C: "#fbbf24", D: "#ef4444",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <div className="pt-24 px-6 pb-10 max-w-6xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">
            Analysis{" "}
            <span className="bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
              History
            </span>
          </h1>
          <p className="text-gray-500">Your real code analysis records</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: <Code2 size={20} className="text-purple-400" />, label: "Total Analyses", value: history.length },
            { icon: <TrendingUp size={20} className="text-green-400" />, label: "Average Score", value: `${avgScore}/100` },
            { icon: <Clock size={20} className="text-blue-400" />, label: "Status", value: loading ? "Loading..." : "Up to date" },
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

      
        {chartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-8"
          >
            <h3 className="text-white font-semibold mb-4">📈 Score Trend</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <XAxis dataKey="index" stroke="#374151" tick={{ fill: "#6b7280", fontSize: 12 }} />
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
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading history...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && history.length === 0 && (
          <div className="text-center py-20 rounded-2xl bg-white/5 border border-white/10 border-dashed">
            <p className="text-4xl mb-4">📭</p>
            <h3 className="text-white font-semibold text-lg mb-2">No analyses yet!</h3>
            <p className="text-gray-500 text-sm mb-6">Go analyze some code first</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/analyzer")}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium text-sm"
            >
              Start Analyzing 🚀
            </motion.button>
          </div>
        )}

        {/* History Table */}
        {!loading && history.length > 0 && (
          <>
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

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
            >
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    {["#", "Lines", "Loops", "Complexity", "Score", "Grade"].map((h) => (
                      <th key={h} className="text-left text-xs text-gray-500 uppercase tracking-wider px-5 py-4 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, i) => {
                    const grade = getGrade(item.productivityScore || 0);
                    const color = gradeColor[grade];
                    return (
                      <motion.tr
                        key={item.id || i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-5 py-4 text-gray-500 text-sm">{i + 1}</td>
                        <td className="px-5 py-4 text-white text-sm font-medium">{item.lines}</td>
                        <td className="px-5 py-4 text-gray-300 text-sm">{item.loops}</td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {item.complexity}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${item.productivityScore || 0}%`, background: color }}
                              />
                            </div>
                            <span className="text-white text-sm font-medium">{item.productivityScore || 0}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className="px-2.5 py-1 rounded-lg text-sm font-bold"
                            style={{ color, background: `${color}15` }}
                          >
                            {grade}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}