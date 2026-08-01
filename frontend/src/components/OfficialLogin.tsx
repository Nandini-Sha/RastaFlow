import { useState } from "react";
import { Lock, ArrowRight, ShieldAlert } from "lucide-react";

interface OfficialLoginProps {
  onLogin: () => void;
}

export default function OfficialLogin({ onLogin }: OfficialLoginProps) {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple hardcoded passcode for the prototype: 1234
    if (passcode === "1234") {
      setError(false);
      localStorage.setItem("isOfficial", "true");
      onLogin();
    } else {
      setError(true);
      setPasscode("");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xl p-8 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center border border-red-200 dark:border-red-800">
              <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-500" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Restricted Access
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-8 text-sm">
            This area is restricted to authorized traffic officials. Please enter your 4-digit access code. (Hint: 1234)
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="Enter Passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className={`block w-full pl-11 pr-4 py-3 sm:text-lg border rounded-xl bg-white dark:bg-gray-700 text-center tracking-[0.5em] text-gray-900 dark:text-white focus:ring-2 focus:outline-none transition-all shadow-sm ${
                    error 
                      ? "border-red-300 dark:border-red-600 focus:ring-red-500 bg-red-50 dark:bg-red-900/10" 
                      : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                  required
                />
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-center animate-in fade-in slide-in-from-top-1">
                  Incorrect passcode. Please try again.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white p-3 rounded-xl font-bold shadow-lg shadow-red-500/30 transition-all hover:-translate-y-0.5"
            >
              Authenticate
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
