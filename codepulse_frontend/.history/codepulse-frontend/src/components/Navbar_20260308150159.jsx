import { motion } from "framer-motion";
import { Code2, History, LogIn, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Navbar() {
  const navigate = useNavigate();
  const user = localStorage.getItem("user");

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 w-full z-50 backdrop-blur-md bg-black/30 border-b border-white/10 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">

        {/* Logo */}
        <Link to="/">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-green-400 flex items-center justify-center">
              <Code2 size={18} color="white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
              CodePulse
            </span>
          </motion.div>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-6">

          {/* Analyzer & History - always visible */}
          <Link to="/analyzer" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors text-sm font-medium">
            <Code2 size={16} />
            Analyzer
          </Link>
          <Link to="/history" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors text-sm font-medium">
            <History size={16} />
            History
          </Link>

          {/*Login / Logout based on user */}
          {user ? (
            // Logged in - show user email + logout button
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <User size={14} className="text-purple-400" />
                <span className="text-sm text-gray-300 max-w-[120px] truncate">
                  {user}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-all text-sm font-medium"
              >
                <LogOut size={16} />
                Logout
              </motion.button>
            </div>
          ) : (
            // Not logged in - show login button
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all text-sm font-medium"
              >
                <LogIn size={16} />
                Login
              </motion.button>
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
}