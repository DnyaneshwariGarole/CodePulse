import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ GitHub OAuth success - user logged in
    // Backend ने redirect केलं म्हणजे login successful
    localStorage.setItem("user", "github_user");
    toast.success("GitHub Login Successful! 🎉");
    navigate("/analyzer");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Logging you in...</p>
      </div>
    </div>
  );
}