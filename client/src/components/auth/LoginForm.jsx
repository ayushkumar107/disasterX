import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const {
    login,
    isLoading,
    error,
    clearError
  } = useAuthStore();
  const navigate = useNavigate();
  const handleSubmit = async e => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      navigate('/');
    } catch {
      // Error is handled in store
    }
  };
  return <div className="min-h-screen flex items-center justify-center bg-[var(--color-dx-bg)] relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-5" style={{
      backgroundImage: `
            linear-gradient(rgba(0,212,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.3) 1px, transparent 1px)
          `,
      backgroundSize: '60px 60px'
    }} />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]
        rounded-full opacity-10" style={{
      background: 'radial-gradient(circle, rgba(0,212,255,0.3) 0%, transparent 70%)'
    }} />

      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.5
    }} className="relative z-10 w-full max-w-md mx-4">
        <div className="glass-panel-strong p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Shield size={28} className="text-[var(--color-dx-cyan)]" />
              <span className="text-xl font-bold tracking-wider">
                DISASTER<span className="text-[var(--color-dx-cyan)]">-X</span>
              </span>
            </div>
            <p className="text-[var(--color-dx-muted)] text-sm">
              Global Disaster Intelligence Platform
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="w-12 h-px bg-[var(--color-dx-border)]" />
              <span className="telemetry-label">SECURE LOGIN</span>
              <div className="w-12 h-px bg-[var(--color-dx-border)]" />
            </div>
          </div>

          {/* Error */}
          {error && <motion.div initial={{
          opacity: 0,
          y: -10
        }} animate={{
          opacity: 1,
          y: 0
        }} className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-[rgba(239,68,68,0.1)]
                border border-[rgba(239,68,68,0.2)] text-[var(--color-dx-critical)] text-sm">
              <AlertCircle size={16} />
              {error}
            </motion.div>}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="telemetry-label block mb-1.5">EMAIL</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-dx-muted)]" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field pl-10" placeholder="operator@disaster-x.com" required autoComplete="email" />
              </div>
            </div>

            <div>
              <label className="telemetry-label block mb-1.5">PASSWORD</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-dx-muted)]" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="input-field pl-10 pr-10" placeholder="••••••••" required autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-dx-muted)]
                    hover:text-[var(--color-dx-white)] transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full btn-primary py-3 font-semibold tracking-wider text-sm
                disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-[var(--color-dx-cyan)] border-t-transparent
                    rounded-full animate-spin" />
                  AUTHENTICATING...
                </span> : 'ACCESS SYSTEM'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-[var(--color-dx-muted)] text-sm">No credentials? </span>
            <Link to="/register" className="text-[var(--color-dx-cyan)] text-sm hover:underline">
              Register
            </Link>
          </div>
        </div>

        {/* Bottom disclaimer */}
        <p className="text-center text-[var(--color-dx-muted)] text-[10px] mt-4 opacity-60">
          DISASTER-X Emergency Response Simulation Platform
        </p>
      </motion.div>
    </div>;
};
