import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "@monaco-editor/react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Play, CheckCircle, AlertTriangle, XCircle, ChevronDown, Upload, Github, X, FileCode, FolderOpen } from "lucide-react";
import API from "../api";
import JSZip from "jszip";

// All supported file extensions
const CODE_EXTENSIONS = [
  // Java
  ".java", ".jar", ".war",
  // JavaScript / Web
  ".js", ".jsx", ".ts", ".tsx", ".html", ".css", ".scss",
  // Python
  ".py", ".pyw",
  // C / C++ / C#
  ".c", ".cpp", ".cc", ".h", ".hpp", ".cs",
  // Other
  ".go", ".rb", ".php", ".swift", ".kt", ".rs", ".xml", ".json", ".yml", ".yaml",
];

const ARCHIVE_EXTENSIONS = [".zip", ".jar", ".war"];

const detectLanguage = (fileName) => {
  const f = fileName.toLowerCase();
  if (f.endsWith(".java")) return "java";
  if ([".js", ".jsx", ".ts", ".tsx"].some((e) => f.endsWith(e))) return "javascript";
  if ([".py", ".pyw"].some((e) => f.endsWith(e))) return "python";
  if ([".cpp", ".cc", ".c", ".h", ".hpp"].some((e) => f.endsWith(e))) return "cpp";
  if (f.endsWith(".cs")) return "csharp";
  if (f.endsWith(".go")) return "go";
  if (f.endsWith(".rb")) return "ruby";
  if (f.endsWith(".php")) return "php";
  if (f.endsWith(".swift")) return "swift";
  if (f.endsWith(".kt")) return "kotlin";
  if (f.endsWith(".rs")) return "rust";
  if ([".html", ".htm"].some((e) => f.endsWith(e))) return "html";
  if ([".css", ".scss"].some((e) => f.endsWith(e))) return "css";
  if ([".xml", ".yml", ".yaml"].some((e) => f.endsWith(e))) return "yaml";
  if (f.endsWith(".json")) return "json";
  return "plaintext";
};

const getFileIcon = (fileName) => {
  const f = fileName.toLowerCase();
  if (f.endsWith(".java")) return "☕";
  if (f.endsWith(".jar")) return "📦";
  if (f.endsWith(".war")) return "🌐";
  if ([".js", ".jsx"].some((e) => f.endsWith(e))) return "🟨";
  if ([".ts", ".tsx"].some((e) => f.endsWith(e))) return "🔷";
  if ([".py", ".pyw"].some((e) => f.endsWith(e))) return "🐍";
  if ([".cpp", ".cc", ".c"].some((e) => f.endsWith(e))) return "⚙️";
  if (f.endsWith(".cs")) return "💜";
  if (f.endsWith(".go")) return "🐹";
  if (f.endsWith(".rb")) return "💎";
  if (f.endsWith(".php")) return "🐘";
  if (f.endsWith(".swift")) return "🍎";
  if (f.endsWith(".kt")) return "🟠";
  if (f.endsWith(".rs")) return "🦀";
  if ([".html", ".htm"].some((e) => f.endsWith(e))) return "🌐";
  if ([".css", ".scss"].some((e) => f.endsWith(e))) return "🎨";
  if (f.endsWith(".json")) return "📋";
  return "📄";
};

const isCodeFile = (fileName) => {
  return CODE_EXTENSIONS.some((ext) => fileName.toLowerCase().endsWith(ext));
};

const isArchiveFile = (fileName) => {
  return ARCHIVE_EXTENSIONS.some((ext) => fileName.toLowerCase().endsWith(ext));
};

export default function AnalyzerPage() {
  const [code, setCode] = useState("// Paste your code here...");
  const [language, setLanguage] = useState("java");
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("paste");
  const [githubUrl, setGithubUrl] = useState("");
  const [githubLoading, setGithubLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [zipFiles, setZipFiles] = useState([]);
  const [selectedZipFile, setSelectedZipFile] = useState(null);
  const [zipLoading, setZipLoading] = useState(false);
  const [archiveType, setArchiveType] = useState(""); // zip | jar | war
  const [searchQuery, setSearchQuery] = useState("");

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
      setScore({
        overall: data.productivityScore,
        grade: getGrade(data.productivityScore),
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

  // ✅ Archive (ZIP / JAR / WAR) Handler
  const handleArchiveUpload = async (file) => {
    setZipLoading(true);
    setZipFiles([]);
    setSelectedZipFile(null);
    setSearchQuery("");

    const ext = file.name.toLowerCase().endsWith(".jar") ? "JAR"
      : file.name.toLowerCase().endsWith(".war") ? "WAR" : "ZIP";
    setArchiveType(ext);

    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      const codeFiles = [];
      const promises = [];

      contents.forEach((relativePath, zipEntry) => {
        if (zipEntry.dir) return;

        // Skip unnecessary folders
        const skipFolders = ["node_modules/", ".git/", "/target/", "/build/", "/.idea/", "__pycache__/", ".class"];
        if (skipFolders.some((f) => relativePath.includes(f))) return;

        // For JAR - only show .java, .class (decompiled), xml, properties
        if (ext === "JAR") {
          if (![".java", ".xml", ".properties", ".mf", ".yml", ".json"].some((e) => relativePath.toLowerCase().endsWith(e))) return;
        }

        if (!isCodeFile(relativePath)) return;

        const promise = zipEntry.async("string").then((content) => {
          codeFiles.push({
            name: relativePath,
            shortName: relativePath.split("/").pop(),
            content: content,
            language: detectLanguage(relativePath),
            size: content.length,
          });
        }).catch(() => {}); // skip binary files silently

        promises.push(promise);
      });

      await Promise.all(promises);

      if (codeFiles.length === 0) {
        toast.error(`No readable code files found in ${ext}!`);
        setZipLoading(false);
        return;
      }

      codeFiles.sort((a, b) => a.name.localeCompare(b.name));
      setZipFiles(codeFiles);
      toast.success(`${ext} loaded! ${codeFiles.length} files found 🎉`);
    } catch (err) {
      toast.error(`Failed to read ${ext} file!`);
    } finally {
      setZipLoading(false);
    }
  };

  // ✅ Main File Upload Handler
  const handleFileUpload = (file) => {
    if (!file) return;

    // Archive files
    if (isArchiveFile(file.name)) {
      handleArchiveUpload(file);
      return;
    }

    // Single code file
    if (!isCodeFile(file.name)) {
      toast.error("Unsupported file type!");
      return;
    }

    setLanguage(detectLanguage(file.name));
    const reader = new FileReader();
    reader.onload = (e) => {
      setCode(e.target.result);
      setActiveTab("paste");
      toast.success(`"${file.name}" loaded! 🎉`);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files[0]);
  };

  const handleSelectZipFile = (file) => {
    setSelectedZipFile(file.name);
    setCode(file.content);
    setLanguage(file.language);
    setActiveTab("paste");
    toast.success(`"${file.shortName}" loaded! 🚀`);
  };

  // ✅ GitHub Fetch
  const handleGithubFetch = async () => {
    if (!githubUrl.trim()) { toast.error("Please enter a GitHub URL!"); return; }
    let rawUrl = githubUrl.trim();
    if (rawUrl.includes("github.com") && rawUrl.includes("/blob/")) {
      rawUrl = rawUrl.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
    } else if (!rawUrl.includes("raw.githubusercontent.com")) {
      toast.error("Please paste a valid GitHub file URL!"); return;
    }
    setGithubLoading(true);
    try {
      const response = await fetch(rawUrl);
      if (!response.ok) throw new Error();
      const text = await response.text();
      setCode(text);
      setLanguage(detectLanguage(rawUrl));
      setActiveTab("paste");
      setGithubUrl("");
      toast.success("Code fetched from GitHub! 🐙");
    } catch {
      toast.error("Failed to fetch! Check URL or make repo public.");
    } finally {
      setGithubLoading(false);
    }
  };

  const filteredFiles = zipFiles.filter(
    (f) => f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const metrics = score ? [
    { label: "Complexity", value: score.complexity, icon: <CheckCircle className="text-green-400" size={18} /> },
    { label: "Duplicate Lines", value: score.duplicates, icon: <AlertTriangle className="text-yellow-400" size={18} /> },
    { label: "Total Loops", value: score.loops, icon: <XCircle className="text-red-400" size={18} /> },
    { label: "Total Lines", value: `${score.lines} lines`, icon: <CheckCircle className="text-blue-400" size={18} /> },
  ] : [];

  const languages = [
    { value: "java", label: "☕ Java" },
    { value: "javascript", label: "🟨 JavaScript" },
    { value: "python", label: "🐍 Python" },
    { value: "cpp", label: "⚙️ C/C++" },
    { value: "csharp", label: "💜 C#" },
    { value: "go", label: "🐹 Go" },
    { value: "ruby", label: "💎 Ruby" },
    { value: "php", label: "🐘 PHP" },
    { value: "swift", label: "🍎 Swift" },
    { value: "kotlin", label: "🟠 Kotlin" },
    { value: "rust", label: "🦀 Rust" },
    { value: "html", label: "🌐 HTML" },
    { value: "css", label: "🎨 CSS" },
    { value: "json", label: "📋 JSON" },
  ];

  const tabs = [
    { id: "paste", label: "📝 Paste Code" },
    { id: "upload", label: "📁 Upload File" },
    { id: "github", label: "🐙 GitHub URL" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <div className="pt-24 px-6 pb-10 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">
          Code{" "}
          <span className="bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">Analyzer</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left */}
          <div className="rounded-2xl overflow-hidden border border-white/10">

            {/* Tabs */}
            <div className="flex bg-[#111827] border-b border-white/10">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 text-xs font-semibold transition-all ${
                    activeTab === tab.id ? "text-white border-b-2 border-purple-500 bg-white/5" : "text-gray-500 hover:text-gray-300"
                  }`}>
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
                      <select value={language} onChange={(e) => setLanguage(e.target.value)}
                        className="appearance-none bg-white/10 text-white font-semibold text-sm px-4 py-2 pr-8 rounded-lg border border-purple-500/30 outline-none cursor-pointer hover:bg-white/15 transition-all"
                        style={{ color: "white", fontWeight: "600" }}>
                        {languages.map((l) => (
                          <option key={l.value} value={l.value} style={{ background: "#111827", color: "white", fontWeight: "600" }}>
                            {l.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" />
                    </div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={analyzeCode} disabled={loading}
                      className="flex items-center gap-2 px-5 py-2 rounded-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 transition-all text-sm">
                      {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing...</> : <><Play size={16} />Analyze 🚀</>}
                    </motion.button>
                  </div>
                  <Editor height="500px" language={language} value={code} onChange={(val) => setCode(val)}
                    theme="vs-dark" options={{ fontSize: 14, minimap: { enabled: false }, padding: { top: 16 } }} />
                </motion.div>
              )}

              {/* UPLOAD TAB */}
              {activeTab === "upload" && (
                <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="p-5 min-h-[560px] bg-[#0d1117]">

                  {/* Drop Zone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current.click()}
                    className={`w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all mb-4 ${
                      dragOver ? "border-purple-400 bg-purple-500/10" : "border-white/20 hover:border-purple-500/50 hover:bg-white/5"
                    }`}>
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
                      {zipLoading
                        ? <div className="w-5 h-5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                        : <Upload className="text-purple-400" size={22} />}
                    </div>
                    <h3 className="text-white font-semibold mb-1 text-sm">
                      {zipLoading ? "Reading file..." : dragOver ? "Drop it! 🎯" : "Upload Any Code File"}
                    </h3>
                    <p className="text-gray-500 text-xs text-center mb-3">Drag & drop or click to browse</p>

                    {/* File type badges */}
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {[
                        { label: ".zip", color: "purple" },
                        { label: ".jar", color: "orange" },
                        { label: ".war", color: "blue" },
                        { label: ".java", color: "gray" },
                        { label: ".py", color: "gray" },
                        { label: ".js", color: "gray" },
                        { label: ".cs", color: "gray" },
                        { label: ".cpp", color: "gray" },
                        { label: ".ts", color: "gray" },
                        { label: ".go", color: "gray" },
                        { label: ".rb", color: "gray" },
                        { label: ".php", color: "gray" },
                      ].map((ext) => (
                        <span key={ext.label} className={`px-2 py-0.5 rounded text-xs border ${
                          ext.color === "purple" ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                          : ext.color === "orange" ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                          : ext.color === "blue" ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                          : "bg-white/5 border-white/10 text-gray-400"
                        }`}>
                          {ext.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <input ref={fileInputRef} type="file"
                    accept=".java,.jar,.war,.js,.jsx,.ts,.tsx,.py,.pyw,.cpp,.c,.cc,.h,.cs,.go,.rb,.php,.swift,.kt,.rs,.html,.css,.scss,.json,.xml,.yml,.zip"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files[0])} />

                  {/* Files List from Archive */}
                  {zipFiles.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FolderOpen size={15} className="text-purple-400" />
                          <span className="text-white text-sm font-semibold">
                            {archiveType} → {zipFiles.length} files
                          </span>
                        </div>
                        <button onClick={() => { setZipFiles([]); setSelectedZipFile(null); }}
                          className="text-gray-500 hover:text-gray-300 transition-colors">
                          <X size={14} />
                        </button>
                      </div>

                      {/* Search */}
                      <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search files..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 text-xs mb-2 transition-all" />

                      {/* File List */}
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {filteredFiles.map((file, i) => (
                          <motion.button key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.02 }}
                            onClick={() => handleSelectZipFile(file)}
                            className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                              selectedZipFile === file.name
                                ? "bg-purple-500/20 border-purple-500/50 text-white"
                                : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-purple-500/30"
                            }`}>
                            <span className="text-base">{getFileIcon(file.name)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{file.shortName}</p>
                              <p className="text-xs text-gray-500 truncate">{file.name}</p>
                            </div>
                            {selectedZipFile === file.name && <CheckCircle size={14} className="text-purple-400 shrink-0" />}
                          </motion.button>
                        ))}
                        {filteredFiles.length === 0 && (
                          <p className="text-gray-500 text-xs text-center py-4">No files match "{searchQuery}"</p>
                        )}
                      </div>

                      {selectedZipFile && (
                        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          onClick={() => setActiveTab("paste")}
                          className="w-full mt-3 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2">
                          <Play size={14} />Go to Editor & Analyze
                        </motion.button>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* GITHUB TAB */}
              {activeTab === "github" && (
                <motion.div key="github" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="p-6 min-h-[560px] flex flex-col items-center justify-center bg-[#0d1117]">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                    <Github className="text-white" size={28} />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">Fetch from GitHub</h3>
                  <p className="text-gray-500 text-sm text-center mb-8">Paste any public GitHub file URL</p>
                  <div className="w-full space-y-3">
                    <div className="relative">
                      <input type="text" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleGithubFetch()}
                        placeholder="https://github.com/user/repo/blob/main/File.java"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-all text-sm" />
                      {githubUrl && (
                        <button onClick={() => setGithubUrl("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={handleGithubFetch} disabled={githubLoading}
                      className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 transition-all text-sm">
                      {githubLoading
                        ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Fetching...</>
                        : <><Github size={16} />Fetch Code</>}
                    </motion.button>
                  </div>
                  <div className="mt-8 w-full p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><FileCode size={12} /> Example URL:</p>
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
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-6">
                  <div className="relative w-28 h-28">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#1f2937" strokeWidth="10" />
                      <motion.circle cx="50" cy="50" r="40" fill="none" stroke="#6366f1" strokeWidth="10" strokeLinecap="round"
                        initial={{ strokeDasharray: "0 251" }}
                        animate={{ strokeDasharray: `${score.overall * 2.51} 251` }}
                        transition={{ duration: 1.5, ease: "easeOut" }} />
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
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 mb-1">{m.icon}<span className="text-sm text-gray-400">{m.label}</span></div>
                      <p className="text-white font-semibold text-sm">{m.value}</p>
                    </motion.div>
                  ))}
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <h3 className="font-semibold text-white mb-3">💡 Suggestions</h3>
                  <ul className="space-y-2">
                    {score.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-purple-400 mt-0.5">→</span>{s}
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
                <p className="text-gray-500 text-sm">Paste code, upload file/ZIP/JAR/WAR, or fetch from GitHub!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}