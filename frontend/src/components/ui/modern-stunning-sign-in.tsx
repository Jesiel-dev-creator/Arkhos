"use client"
import * as React from "react";

const SignIn1 = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const handleSignIn = () => {
    if (!email || !password) { setError("Please enter both email and password."); return; }
    if (!validateEmail(email)) { setError("Please enter a valid email address."); return; }
    setError("");
    alert("Sign in successful!");
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020408] relative overflow-hidden w-full">
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-r from-white/[0.06] to-[#020408] backdrop-blur-sm border border-white/10 shadow-2xl p-8 flex flex-col items-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#FF6B35]/20 border border-[#FF6B35]/30 mb-6">
          <span className="text-[#FF6B35] font-bold text-xl">A</span>
        </div>
        <h2 className="text-2xl font-semibold text-white mb-6 text-center font-[Syne]">ArkhosAI</h2>
        <div className="flex flex-col w-full gap-4">
          <div className="w-full flex flex-col gap-3">
            <input placeholder="Email" type="email" value={email}
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
              onChange={(e) => setEmail(e.target.value)} />
            <input placeholder="Password" type="password" value={password}
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
              onChange={(e) => setPassword(e.target.value)} />
            {error && <div className="text-sm text-red-400 text-left">{error}</div>}
          </div>
          <hr className="opacity-10" />
          <div>
            <button onClick={handleSignIn}
              className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-medium px-5 py-3 rounded-full shadow transition mb-3 text-sm">
              Sign in
            </button>
            <div className="w-full text-center mt-2">
              <span className="text-xs text-gray-400">Don&apos;t have an account?{' '}
                <a href="#" className="underline text-white/80 hover:text-white">Sign up, it&apos;s free!</a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SignIn1 };
export default SignIn1;
