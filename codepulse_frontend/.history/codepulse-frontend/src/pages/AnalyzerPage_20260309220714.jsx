import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "@monaco-editor/react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Play, CheckCircle, AlertTriangle, XCircle, ChevronDown, Upload, Github, X, FileCode, FolderOpen, File } from "lucide-react";
import API from "../api";
import JSZip from "jszip";

export default function AnalyzerPage() {
  const [code, setCode] = useState("// Paste your code here...");
  const [language, setLanguage] = useState("java");
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("paste");
  const [githubUrl, setGithubUrl] = useState("");
  const [githubLoading, setGithubLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // ZIP states
  const [zipFiles, setZipFiles] = useState([]); // list of files inside zip
  const [selectedZipFile, setSelectedZipFile] = useState(null);
  const [zipLoading, setZipLoading] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

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

  const buildSuggestions = (data) => {
    const suggestions = [];
    if (data.loops >= 2) suggestions.push("⚠️ Nested loops detected — optimize for better performance");
    if (data.loops === 1) suggestions.push("ℹ️ One loop found — check if it can be simplified");
    if (data.duplicateLines > 0) suggestions.push(`⚠️ ${data.duplicateLines} duplicate lines — refactor to avoid repetition`);
    if (data.productivityScore < 60) suggestions.push("❌ Low score — review your code structure");
    if (data.lines > 100) suggestions.push("ℹ️ Large file — consider breaking into smaller methods");
    if (suggestions.length === 0) suggestions.push("✅ Great code! No major issues found");
    return suggestions;
  };

  const analyzeCode = async () => {
    if (!code || code.trim() === "" || code.trim() === "// Paste your code here...") {
      toast.error("Please paste some code first!");
      return;
    }
    setLoading(true);
    try {
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
    } finally {
      setLoading(false);
    }
  };

  // Detect language from filename
  const detectLanguage = (fileName) => {
    const f = fileName.toLowerCase();
    if (f.endsWith(".java")) return "java";
    if (f.endsWith(".js") || f.endsWith(".ts") || f.endsWith(".jsx") || f.endsWith(".tsx")) return "javascript";
    if (f.endsWith(".py")) return "python";
    if (f.endsWith(".cpp") || f.endsWith(".c") || f.endsWith(".cc")) return "cpp";
    return "java";
  };
  // Check if file is a code file
  const isCodeFile = (fileName) => {
    const codeExtensions = [".java", ".js", ".ts", ".jsx", ".tsx", ".py", ".cpp", ".c", ".cc", ".cs", ".go", ".rb", ".php"];
    return codeExtensions.some((ext) => fileName.toLowerCase().endsWith(ext));
  };

  //Single File Upload Handler
  const handleFileUpload = (file) => {
    if (!file) return;

    // If ZIP file
    if (file.name.toLowerCase().endsWith(".zip")) {
      handleZipUpload(file);
      return;
    }

    if (!isCodeFile(file.name)) {
      toast.error("Only code files (.java, .js, .py, .cpp) or .zip allowed!");
      return;
    }

    setLanguage(detectLanguage(file.name));
    const reader = new FileReader();
    reader.onload = (e) => {
      setCode(e.target.result);
      setActiveTab("paste");
      toast.success(`File "${file.name}" loaded! 🎉`);
    };
    reader.readAsText(file);
  };

  // ZIP Upload Handler
  const handleZipUpload = async (file) => {
    setZipLoading(true);
    setZipFiles([]);
    setSelectedZipFile(null);

    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);

      const codeFiles = [];

      // Extract all code files from ZIP
      const promises = [];
      contents.forEach((relativePath, zipEntry) => {
        if (!zipEntry.dir && isCodeFile(relativePath)) {
          // Skip node_modules, .git, target, build folders
          if (
            relativePath.includes("node_modules/") ||
            relativePath.includes(".git/") ||
            relativePath.includes("/target/") ||
            relativePath.includes("/build/") ||
            relativePath.includes("/.idea/")
          ) {
            return;
          }

          const promise = zipEntry.async("string").then((content) => {
            codeFiles.push({
              name: relativePath,
              shortName: relativePath.split("/").pop(),
              content: content,
              language: detectLanguage(relativePath),
            });
          });
          promises.push(promise);
        }
      });

      await Promise.all(promises);

      if (codeFiles.length === 0) {
        toast.error("No code files found in ZIP!");
        setZipLoading(false);
        return;
      }

      // Sort by name
      codeFiles.sort((a, b) => a.name.localeCompare(b.name));
      setZipFiles(codeFiles);
      toast.success(`ZIP loaded! ${codeFiles.length} code files found 🎉`);
    } catch (err) {
      toast.error("Failed to read ZIP file!");
      console.error(err);
    } finally {
      setZipLoading(false);
    }
  };

  // Select file from ZIP list
  const handleSelectZipFile = (file) => {
    setSelectedZipFile(file.name);
    setCode(file.content);
    setLanguage(file.language);
    setActiveTab("paste");
    toast.success(`"${file.shortName}" loaded into editor! 🚀`);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  // GitHub URL Fetch
  const handleGithubFetch = async () => {
    if (!githubUrl.trim()) {
      toast.error("Please enter a GitHub URL!");
      return;
    }

    let rawUrl = githubUrl.trim();
    if (rawUrl.includes("github.com") && rawUrl.includes("/blob/")) {
      rawUrl = rawUrl
        .replace("github.com", "raw.githubusercontent.com")
        .replace("/blob/", "/");
    } else if (!rawUrl.includes("raw.githubusercontent.com")) {
      toast.error("Please paste a valid GitHub file URL!");
      return;
    }

    setGithubLoading(true);
    try {
      const response = await fetch(rawUrl);
      if (!response.ok) throw new Error("File not found!");
      const text = await response.text();
      setCode(text);
      setLanguage(detectLanguage(rawUrl));
      setActiveTab("paste");
      setGithubUrl("");
      toast.success("Code fetched from GitHub! 🐙");
    } catch (err) {
      toast.error("Failed to fetch! Check the URL or make repo public.");
    } finally {
      setGithubLoading(false);
    }
  };

  const metrics = score
    ? [
        { label: "Complexity", value: score.complexity, icon: <CheckCircle className="text-green-400" size={18} /> },
        { label: "Duplicate Lines", value: score.duplicates, icon: <AlertTriangle className="text-yellow-400" size={18} /> },
        { label: "Total Loops", value: score.loops, icon: <XCircle className="text-red-400" size={18} /> },
        { label: "Total Lines", value: `${score.lines} lines`, icon: <CheckCircle className="text-blue-400" size={18} /> },
      ]
    : [];

  const languages = [
    { value: "java", label: "☕ Java" },
    { value: "javascript", label: "🟨 JavaScript" },
    { value: "python", label: "🐍 Python" },
    { value: "cpp", label: "⚙️ C++" },
  ];

  const tabs = [
    { id: "paste", label: "📝 Paste Code" },
    { id: "upload", label: "📁 Upload / ZIP" },
    { id: "github", label: "🐙 GitHub URL" },
  ];

  // File icon based on extension
  const getFileIcon = (fileName) => {
    if (fileName.endsWith(".java")) return "☕";
    if (fileName.endsWith(".py")) return "🐍";
    if (fileName.endsWith(".js") || fileName.endsWith(".jsx")) return "🟨";
    if (fileName.endsWith(".ts") || fileName.endsWith(".tsx")) return "🔷";
    if (fileName.endsWith(".cpp") || fileName.endsWith(".c")) return "⚙️";
    return "📄";
  };

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

          {/* Left - Code Input */}
          <div className="rounded-2xl overflow-hidden border border-white/10">

            {/* Tab Switcher */}
            <div className="flex bg-[#111827] border-b border-white/10">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? "text-white border-b-2 border-purple-500 bg-white/5"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">

              {/* PASTE TAB */}
              {activeTab === "paste" && (
                <motion.div key="paste" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center justify-between px-4 py-3 bg-[#111827] border-b border-white/10">
                    <div className="relative">
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="appearance-none bg-white/10 text-white font-semibold text-sm px-4 py-2 pr-8 rounded-lg border border-purple-500/30 outline-none cursor-pointer hover:bg-white/15 transition-all"
                        style={{ color: "white", fontWeight: "600" }}
                      >
                        {languages.map((l) => (
                          <option key={l.value} value={l.value} style={{ background: "#111827", color: "white", fontWeight: "600" }}>
                            {l.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={analyzeCode}
                      disabled={loading}
                      className="flex items-center gap-2 px-5 py-2 rounded-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 transition-all text-sm"
                    >
                      {loading ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing...</>
                      ) : (
                        <><Play size={16} />Analyze 🚀</>
                      )}
                    </motion.button>
                  </div>
                  <Editor
                    height="500px"
                    language={language}
                    value={code}
                    onChange={(val) => setCode(val)}
                    theme="vs-dark"
                    options={{ fontSize: 14, minimap: { enabled: false }, padding: { top: 16 } }}
                  />
                </motion.div>
              )}

              {/* UPLOAD TAB */}
              {activeTab === "upload" && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 min-h-[560px] bg-[#0d1117]"
                >
                  {/* Drag & Drop Zone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current.click()}
                    className={`w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all mb-5 ${
                      dragOver ? "border-purple-400 bg-purple-500/10" : "border-white/20 hover:border-purple-500/50 hover:bg-white/5"
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-3">
                      {zipLoading ? (
                        <div className="w-6 h-6 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                      ) : (
                        <Upload className="text-purple-400" size={24} />
                      )}
                    </div>
                    <h3 className="text-white font-semibold mb-1">
                      {zipLoading ? "Reading ZIP..." : dragOver ? "Drop it here! 🎯" : "Upload File or ZIP"}
                    </h3>
                    <p className="text-gray-500 text-xs text-center mb-3">Drag & drop or click to browse</p>
                    <div className="flex gap-2 flex-wrap justify-center">
                      {[".java", ".js", ".py", ".cpp", ".zip"].map((ext) => (
                        <span key={ext} className={`px-2 py-1 rounded-md border text-xs ${
                          ext === ".zip" ? "bg-purple-500/10 border-purple-500/30 text-purple-400" : "bg-white/5 border-white/10 text-gray-400"
                        }`}>
                          {ext}
                        </span>
                      ))}
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".java,.js,.py,.cpp,.ts,.c,.cs,.jsx,.tsx,.zip"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                  />

                  {/*ZIP Files List */}
                  {zipFiles.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <FolderOpen size={16} className="text-purple-400" />
                        <span className="text-white text-sm font-semibold">
                          {zipFiles.length} files found — select one to analyze:
                        </span>
                      </div>

                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {zipFiles.map((file, i) => (
                          <motion.button
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            onClick={() => handleSelectZipFile(file)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                              selectedZipFile === file.name
                                ? "bg-purple-500/20 border-purple-500/50 text-white"
                                : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-purple-500/30"
                            }`}
                          >
                            <span className="text-lg">{getFileIcon(file.name)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{file.shortName}</p>
                              <p className="text-xs text-gray-500 truncate">{file.name}</p>
                            </div>
                            {selectedZipFile === file.name && (
                              <CheckCircle size={16} className="text-purple-400 shrink-0" />
                            )}
                          </motion.button>
                        ))}
                      </div>

                      {selectedZipFile && (
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={() => setActiveTab("paste")}
                          className="w-full mt-3 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2"
                        >
                          <Play size={14} />
                          Go to Editor & Analyze
                        </motion.button>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* GITHUB TAB */}
              {activeTab === "github" && (
                <motion.div
                  key="github"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 min-h-[560px] flex flex-col items-center justify-center bg-[#0d1117]"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                    <Github className="text-white" size={28} />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">Fetch from GitHub</h3>
                  <p className="text-gray-500 text-sm text-center mb-8">Paste any public GitHub file URL</p>

                  <div className="w-full space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleGithubFetch()}
                        placeholder="https://github.com/user/repo/blob/main/File.java"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-all text-sm"
                      />
                      {githubUrl && (
                        <button onClick={() => setGithubUrl("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGithubFetch}
                      disabled={githubLoading}
                      className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 transition-all text-sm"
                    >
                      {githubLoading ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Fetching...</>
                      ) : (
                        <><Github size={16} />Fetch Code</>
                      )}
                    </motion.button>
                  </div>

                  <div className="mt-8 w-full p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                      <FileCode size={12} /> Example URL:
                    </p>
                    <p className="text-xs text-purple-400 break-all">
                      https://github.com/user/repo/blob/main/StudentManager.java
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right - Results */}
          <div className="space-y-4">
            {score ? (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-6"
                >
                  <div className="relative w-28 h-28">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#1f2937" strokeWidth="10" />
                      <motion.circle
                        cx="50" cy="50" r="40"
                        fill="none" stroke="#6366f1" strokeWidth="10" strokeLinecap="round"
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
              <div className="h-full flex flex-col items-center justify-center text-center p-10 rounded-2xl bg-white/5 border border-white/10 border-dashed min-h-[500px]">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4">
                  <Play className="text-purple-400" size={28} />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Ready to Analyze</h3>
                <p className="text-gray-500 text-sm">Paste code, upload a file/ZIP, or fetch from GitHub!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}