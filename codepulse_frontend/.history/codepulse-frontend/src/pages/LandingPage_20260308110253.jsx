import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { 
  Zap, Shield, BarChart3, 
  ArrowRight, Code2 
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Zap className="text-yellow-400" />,
      title: "Instant Analysis",
      desc: "Get results in seconds"
    },
    {
      icon: <Shield className="text-green-400" />,
      title: "Security Check",
      desc: "Detect vulnerabilities"
    },
    {
      icon: <BarChart3 className="text-purple-400" />,
      title: "Score & Grade",
      desc: "0-100 productivity score"
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-6 
        text-center relative overflow-hidden">
        
        {/* Glow Effect */}
        <div className="absolute top-20 left-1/2 
          -translate-x-1/2 w-96 h-96 
          bg-purple-600/20 rounded-full 
          blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center 
            gap-2 px-4 py-2 rounded-full 
            bg-purple-500/10 border 
            border-purple-500/30 mb-6">
            <span className="w-2 h-2 rounded-full 
              bg-green-400 animate-pulse" />
            <span className="text-sm text-purple-300">
              AI Powered Code Analyzer
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r 
              from-purple-400 via-pink-400 
              to-green-400 bg-clip-text 
              text-transparent">
              Analyze Your Code
            </span>
            <br />
            <span className="text-white">
              Like Never Before
            </span>
          </h1>

          <p className="text-gray-400 text-xl 
            mb-10 max-w-2xl mx-auto">
            Paste your code and instantly get 
            productivity score, bug detection, 
            and improvement suggestions.
          </p>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/analyzer")}
            className="inline-flex items-center 
              gap-3 px-8 py-4 rounded-xl text-lg 
              font-semibold bg-gradient-to-r 
              from-purple-600 to-indigo-600 
              hover:from-purple-500 
              hover:to-indigo-500 
              shadow-lg shadow-purple-500/25 
              transition-all"
          >
            <Code2 size={20} />
            Start Analyzing
            <ArrowRight size={20} />
          </motion.button>
        </motion.div>

        {/* Features Cards */}
        <div className="mt-24 grid grid-cols-1 
          md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl 
                bg-white/5 border border-white/10 
                backdrop-blur-sm text-left"
            >
              <div className="w-10 h-10 rounded-lg 
                bg-white/10 flex items-center 
                justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold 
                text-white mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}