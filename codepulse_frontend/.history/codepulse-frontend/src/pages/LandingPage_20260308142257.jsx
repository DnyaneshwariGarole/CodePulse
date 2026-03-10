import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Zap, Shield, BarChart3, ArrowRight, Code2, Sparkles } from "lucide-react";

const taglines = [
  "Write Smarter. Ship Faster.",
  "Your Code's Hidden Flaws — Exposed Instantly.",
  "Because Great Code Doesn't Happen by Accident.",
];

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Zap className="text-yellow-400" size={22} />,
      title: "Instant Analysis",
      desc: "Get deep insights in seconds, not hours",
    },
    {
      icon: <Shield className="text-green-400" size={22} />,
      title: "Security Check",
      desc: "Catch vulnerabilities before they catch you",
    },
    {
      icon: <BarChart3 className="text-purple-400" size={22} />,
      title: "Productivity Score",
      desc: "Know exactly how clean your code is",
    },
  ];

  const stats = [
    { value: "100+", label: "Analyses Done" },
    { value: "5+", label: "Languages Supported" },
    { value: "99%", label: "Accuracy Rate" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-6 text-center relative overflow-hidden">

        {/* Background Glows */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-green-600/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-8"
          >
            <Sparkles size={14} className="text-purple-400" />
            <span className="text-sm text-purple-300 font-medium">AI Powered Code Intelligence</span>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-6xl md:text-7xl font-black mb-4 leading-tight"
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-green-400 bg-clip-text text-transparent">
              Write Smarter.
            </span>
            <br />
            <span className="text-white">Ship Faster.</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 text-xl mb-4 max-w-2xl mx-auto"
          >
            Your code's hidden flaws — exposed instantly.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-600 text-base mb-10 max-w-xl mx-auto"
          >
            Paste your code. Get a productivity score, bug detection, complexity analysis, and improvement suggestions — all in one place.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25 transition-all"
            >
              <Code2 size={20} />
              Start Analyzing Free
              <ArrowRight size={20} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-medium border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 transition-all"
            >
              View Demo →
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-12 mt-16 mb-24"
        >
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-black bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
                {s.value}
              </p>
              <p className="text-gray-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Features Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.15 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-24 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-white mb-12">
            How it{" "}
            <span className="bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
              works
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Paste Your Code", desc: "Copy-paste any code in our smart editor" },
              { step: "02", title: "Click Analyze", desc: "Our engine scans every line instantly" },
              { step: "03", title: "Get Results", desc: "Score, grade & actionable suggestions" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-400 font-black text-lg">{s.step}</span>
                </div>
                <h3 className="text-white font-semibold mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-24 p-10 rounded-3xl bg-gradient-to-br from-purple-600/10 to-indigo-600/10 border border-purple-500/20 max-w-2xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-white mb-3">
            Ready to write better code?
          </h2>
          <p className="text-gray-400 mb-6">Join developers who care about code quality.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/login")}
            className="px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all"
          >
            Get Started — It's Free 🚀
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}