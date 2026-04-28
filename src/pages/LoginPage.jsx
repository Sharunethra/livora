import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login
    localStorage.setItem('token', 'dummy_token');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
            LIVORA
          </h1>
          <p className="text-slate-400">Welcome back! Please enter your details.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Email Address</label>
            <input 
              type="email" 
              required
              className="input-field"
              placeholder="admin@livora.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <input 
              type="password" 
              required
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-slate-400">
              <input type="checkbox" className="rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-indigo-500/50" />
              Remember me
            </label>
            <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</a>
          </div>

          <button type="submit" className="btn-primary w-full py-3 text-lg font-bold">
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-slate-400">
          Don't have an account? <a href="#" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">Request Access</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
