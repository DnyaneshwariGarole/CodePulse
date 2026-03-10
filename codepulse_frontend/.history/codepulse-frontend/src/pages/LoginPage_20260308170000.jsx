import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Code2, Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import API from "../api";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      toast.error("Please fill all fields!");
      return;
    }
    if (!isLogin && !form.name) {
      toast.error("Please enter your name!");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const res = await API.post("/api/auth/login", {
          email: form.email,
          password: form.password,
        });
        if (res.data === "Login Successful") {
          toast.success("Welcome back! 🎉");
          localStorage.setItem("user", form.email);
          setTimeout(() => navigate("/analyzer"), 1000);
        } else {
          toast.error(res.data);
        }
      } else {
        const res = await API.post("/api/auth/signup", {
          name: form.name,
          email: form.email,
          password: form.password,
        });
        if (res.data === "User Registered Successfully") {
          toast.success("Account created! Please login 🎉");
          setIsLogin(true);
          setForm({ name: "", email: "", password: "" });
        } else {
          toast.error(res.data);
        }
      }
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data || "Something went wrong!");
      } else {
        toast.error("Cannot connect to server! Is backend running?");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ GitHub OAuth Login
  const handleGitHubLogin = () => {
    toast.loading("Redirecting to GitHub...");
    window.location.href = "http://localhost:8080/oauth2/authorization/github";
  };

  // ✅ Google OAuth Login
  const handleGoogleLogin = () => {
    toast.loading("Redirecting to Google...");
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 relative overflow-hidden">

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-green-400 flex items-center justify-center">
            <Code2 size={20} color="white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
            CodePulse
          </span>
        </Link>

        {/* Card */}
        <div
          className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl"
          style={{ boxShadow: "0 0 60px rgba(99,102,241,0.1)" }}
        >
          {/* Toggle */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-8">
            {["Login", "Register"].map((tab) => (
              <button
                key={tab}
                onClick={() => setIsLogin(tab === "Login")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  (isLogin && tab === "Login") || (!isLogin && tab === "Register")
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {/* Name Field */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-all text-sm"
                  />
                </div>
              </motion.div>
            )}

            {/* Email */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/25 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isLogin ? "Logging in..." : "Creating account..."}
                </>
              ) : (
                <>
                  {isLogin ? "Login" : "Create Account"}
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-600 text-xs">or continue with</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* ✅ Social Buttons - Both Working! */}
          <div className="grid grid-cols-2 gap-3">

            {/* GitHub */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGitHubLogin}
              className="py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium transition-all flex items-center justify-center gap-2 hover:border-purple-500/30"
            >
              🐙 GitHub
            </motion.button>

            {/* Google */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGoogleLogin}
              className="py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium transition-all flex items-center justify-center gap-2 hover:border-blue-500/30"
            >
              🌐 Google
            </motion.button>
          </div>
        </div>

        <p className="text-center text-gray-600 text-sm mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}