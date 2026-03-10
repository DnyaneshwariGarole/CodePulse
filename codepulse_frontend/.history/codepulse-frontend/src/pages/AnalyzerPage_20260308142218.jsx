import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Play, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import API from "../api";

export default function AnalyzerPage() {
  const [code, setCode] = useState("// Paste your code here...");
  const [language, setLanguage] = useState("java");
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Login check - login नाही केलं तर redirect
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      toast.error("Please login first!");
      navigate("/login");
    }
  }, [navigate]);

  const getGrade = (s) => {
    if (s >= 90) return "A+";
    if (s >= 80) return "A";
    if (s >= 70) return "B+";
    if (s >= 60) return "B";
    if (s >= 50) return "C";
    return "D";
  };

  const analyzeCode = async () => {
    if (!code || code.trim() === "" || code.trim() === "// Paste your code here...") {
      toast.error("Please paste some code first!");
      return;
    }
    setLoading(true);
    try {
      // ✅ Real Backend API call
      const res = await API.post("/api/code/analyze", {
        code: code,
        language: language,
      });

      const data = res.data;
      const grade = getGrade(data.productivityScore);

      setScore({
        overall: data.productivityScore,
        grade: grade,
        complexity: data.complexity,
        duplicates: data.duplicateLines > 0 ? `${data.duplicateLines} Found ⚠️` : "None ✅",
        loops: data.loops > 0 ? `${data.loops} Found` : "None ✅",
        lines: data.lines,
        suggestions: buildSuggestions(data),
      });

      toast.success("Analysis Complete! 🎉");
    } catch (err) {
      toast.error("Cannot connect to server! Is backend running?");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Real suggestions based on backend data
  const buildSuggestions = (data) => {
    const suggestions = [];
    if (data.loops >= 2) suggestions.push("⚠️ Nested loops detected - Consider optimizing for better performance");
    if (data.loops === 1) suggestions.push("ℹ️ One loop found - Check if it can be simplified");
    if (data.duplicateLines > 0) suggestions.push(`⚠️ ${data.duplicateLines} duplicate lines found - Refactor to avoid repetition`);
    if (data.productivityScore < 60) suggestions.push("❌ Low productivity score - Review your code structure");
    if (data.lines > 100) suggestions.push("ℹ️ Large file - Consider breaking into smaller methods");
    if (suggestions.length === 0) suggestions.push("✅ Great code! No major issues found");
    return suggestions;
  };

  const metrics = score ? [
    { label: "Complexity", value: score.complexity, icon: <CheckCircle className="text-green-400" size={18} /> },
    { label: "Duplicate Lines", value: score.duplicates, icon: <AlertTriangle className="text-yellow-400" size={18} /> },
    { label: "Total Loops", value: score.loops, icon: <XCircle className="text-red-400" size={18} /> },
    { label: "Total Lines", value: `${score.lines} lines`, icon: <CheckCircle className="text-blue-400" size={18} /> },
  ] : [];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <div className="pt-24 px-6 pb-10 max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold text-white mb-6">
          Code{" "}
          <span className="bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
            Analyzer
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left - Code Editor */}
          <div className="rounded-2xl overflow-hidden border border-white/10">

            {/* Editor Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#111827] border-b border-white/10">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-white/10 text-white text-sm px-3 py-1 rounded-lg border border-white/20 outline-none"
              >
                <option value="java">Java</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
              </select>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={analyzeCode}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 rounded-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 transition-all text-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Analyze 🚀
                  </>
                )}
              </motion.button>
            </div>

            {/* Monaco Editor */}
            <Editor
              height="500px"
              language={language}
              value={code}
              onChange={(val) => setCode(val)}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                padding: { top: 16 },
              }}
            />
          </div>

          {/* Right - Results */}
          <div className="space-y-4">
            {score ? (
              <>
                {/* Score Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-6"
                >
                  {/* Circle Score */}
                  <div className="relative w-28 h-28">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#1f2937" strokeWidth="10" />
                      <motion.circle
                        cx="50" cy="50" r="40"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="10"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: "0 251" }}
                        animate={{ strokeDasharray: `${score.overall * 2.51} 251` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-white">{score.overall}</span>
                      <span className="text-xs text-gray-400">/ 100</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-1">Productivity Score</p>
                    <div className="inline-block px-4 py-1 rounded-full text-2xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 mb-2">
                      {score.grade}
                    </div>
                    <p className="text-gray-400 text-sm">
                      {score.overall >= 80 ? "Excellent code! 🏆" : score.overall >= 60 ? "Good code 👍" : "Needs improvement ⚠️"}
                    </p>
                  </div>
                </motion.div>

                {/* Metric Cards */}
                <div className="grid grid-cols-2 gap-3">
                  {metrics.map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {m.icon}
                        <span className="text-sm text-gray-400">{m.label}</span>
                      </div>
                      <p className="text-white font-semibold text-sm">{m.value}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Suggestions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10"
                >
                  <h3 className="font-semibold text-white mb-3">💡 Suggestions</h3>
                  <ul className="space-y-2">
                    {score.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-purple-400 mt-0.5">→</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </>
            ) : (
              /* Empty State */
              <div className="h-full flex flex-col items-center justify-center text-center p-10 rounded-2xl bg-white/5 border border-white/10 border-dashed min-h-[500px]">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4">
                  <Play className="text-purple-400" size={28} />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Ready to Analyze</h3>
                <p className="text-gray-500 text-sm">Paste your code on the left and click "Analyze" to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}