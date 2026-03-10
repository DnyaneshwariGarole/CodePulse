import { motion } from "framer-motion";
import { Code2, History, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 w-full z-50 
        backdrop-blur-md bg-black/30 
        border-b border-white/10 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto 
        flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg 
              bg-gradient-to-br from-purple-500 
              to-green-400 flex items-center 
              justify-center">
              <Code2 size={18} color="white" />
            </div>
            <span className="text-xl font-bold 
              bg-gradient-to-r from-purple-400 
              to-green-400 bg-clip-text 
              text-transparent">
              CodePulse
            </span>
          </motion.div>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-6">
          <Link to="/analyzer"
            className="flex items-center gap-1 
              text-gray-300 hover:text-white 
              transition-colors">
            <Code2 size={16} />
            Analyzer
          </Link>
          <Link to="/history"
            className="flex items-center gap-1 
              text-gray-300 hover:text-white 
              transition-colors">
            <History size={16} />
            History
          </Link>
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 
                px-4 py-2 rounded-lg 
                bg-gradient-to-r from-purple-600 
                to-indigo-600 hover:from-purple-500 
                hover:to-indigo-500 transition-all"
            >
              <LogIn size={16} />
              Login
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}