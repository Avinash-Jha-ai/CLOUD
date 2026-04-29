import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toggleTheme } from '../../features/theme/themeSlice';
import { loginWithGoogle, loginWithEmail, registerWithEmail, sendOtp, verifyOtp, logoutUser, clearError } from '../../features/auth/authSlice';
import { Moon, Sun, LogIn, LogOut, Mail, X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const Navbar = () => {
  const dispatch = useDispatch();
  const themeMode = useSelector((state) => state.theme.mode);
  const { user, loading, error, otpSent } = useSelector((state) => state.auth);
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'verify'
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const [file, setFile] = useState(null);
  const [otp, setOtp] = useState('');

  useEffect(() => {
    // If user is logged in but not verified, show verify modal
    if (user && !user.isVerified) {
      setShowLoginModal(true);
      setAuthMode('verify');
    } else if (user && user.isVerified) {
      setShowLoginModal(false);
    }
  }, [user]);

  const handleEmailAuth = (e) => {
    e.preventDefault();
    if (authMode === 'login') {
      dispatch(loginWithEmail({ email, password }));
    } else if (authMode === 'register') {
      const formData = new FormData();
      formData.append('fullname', fullname);
      formData.append('email', email);
      formData.append('password', password);
      if (file) formData.append('file', file);
      
      dispatch(registerWithEmail(formData));
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (user?.email) {
      dispatch(verifyOtp({ email: user.email, otp }));
    }
  };

  const handleSendOtp = () => {
    dispatch(sendOtp());
  };

  const handleSocialLogin = (provider) => {
    if (provider === 'google') dispatch(loginWithGoogle());
  };

  const closeAndClear = () => {
    if (user && !user.isVerified) return; // Force verification
    setShowLoginModal(false);
    dispatch(clearError());
  };

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <>
      <nav style={{ 
        padding: '1rem 4rem', 
        display: 'grid', 
        gridTemplateColumns: '1fr auto 1fr', 
        alignItems: 'center', 
        borderBottom: '1px solid var(--border-color)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 100,
        background: 'var(--bg-primary)'
      }} className="glass-panel">
        
        {/* Left Section */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '600', fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--accent-red)'} onMouseLeave={e => e.target.style.color = 'var(--text-primary)'}>Home</Link>
          <a href="/#pricing" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '600', fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--accent-red)'} onMouseLeave={e => e.target.style.color = 'var(--text-primary)'}>Pricing</a>
        </div>

        {/* Center Section: Logo */}
        <div style={{ textAlign: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--accent-red)', letterSpacing: '-1px' }}
            >
               CLOUDAVI
            </motion.div>
          </Link>
        </div>

        {/* Right Section */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', justifyContent: 'flex-end' }}>
          {user && user.isVerified && (
            <Link 
              to="/dashboard"
              style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '700', fontSize: '0.95rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem 1rem', borderRadius: '12px' }}
            >
              Dashboard
            </Link>
          )}

          <button 
            onClick={() => dispatch(toggleTheme())}
            style={{ background: 'var(--bg-secondary)', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '12px' }}
          >
            {themeMode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user && user.isVerified ? (
            <div style={{ position: 'relative' }}>
              <motion.div 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', background: 'var(--bg-secondary)', padding: '0.35rem 0.75rem', borderRadius: '100px', border: '1px solid var(--border-color)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <img 
                  src={user.avatar} 
                  alt="Avatar" 
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-red)' }} 
                />
                <span style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{user.fullname.split(' ')[0]}</span>
              </motion.div>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    style={{ 
                      position: 'absolute', 
                      top: '120%', 
                      right: 0, 
                      width: '280px', 
                      background: 'var(--bg-primary)', 
                      borderRadius: '24px', 
                      padding: '1.5rem', 
                      boxShadow: '0 20px 40px rgba(0,0,0,0.2)', 
                      border: '1px solid var(--border-color)',
                      zIndex: 1000
                    }}
                  >
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Storage Used</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent-red)' }}>{user.storageLimit > 0 ? Math.round((user.storageUsed / user.storageLimit) * 100) : 0}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${user.storageLimit > 0 ? (user.storageUsed / user.storageLimit) * 100 : 0}%` }}
                          style={{ height: '100%', background: 'var(--accent-red)' }}
                        />
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)', textAlign: 'center' }}>
                        {formatBytes(user.storageUsed)} used of {formatBytes(user.storageLimit)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <Link 
                        to="/plans" 
                        onClick={() => setShowProfileMenu(false)}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '0.5rem', 
                          background: 'var(--accent-red)', 
                          color: 'white', 
                          padding: '0.75rem', 
                          borderRadius: '12px', 
                          textDecoration: 'none', 
                          fontWeight: '800', 
                          fontSize: '0.9rem' 
                        }}
                      >
                        <Zap size={16} fill="white" /> Upgrade Storage
                      </Link>
                      <button 
                        onClick={() => { dispatch(logoutUser()); setShowProfileMenu(false); }}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '0.5rem', 
                          background: 'transparent', 
                          color: 'var(--text-secondary)', 
                          padding: '0.75rem', 
                          borderRadius: '12px', 
                          border: '1px solid var(--border-color)', 
                          cursor: 'pointer', 
                          fontWeight: '700', 
                          fontSize: '0.9rem' 
                        }}
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button 
              onClick={() => { setAuthMode('login'); setShowLoginModal(true); }}
              style={{ 
                background: 'var(--accent-red)', 
                color: '#fff', 
                border: 'none', 
                padding: '0.6rem 1.5rem', 
                borderRadius: '12px', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                fontWeight: '800',
                fontSize: '0.9rem',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
              }}
            >
              <LogIn size={18} /> Sign In
            </button>
          )}
        </div>
      </nav>

      <AnimatePresence>
        {showLoginModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="glass-panel"
              style={{ background: 'var(--bg-primary)', padding: '2rem', width: '100%', maxWidth: '400px', borderRadius: '24px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
            >
              {!(user && !user.isVerified) && (
                <button 
                  onClick={closeAndClear}
                  style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'var(--bg-secondary)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={18} />
                </button>
              )}
              
              <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', textAlign: 'center', fontSize: '1.75rem', fontWeight: '800' }}>
                {authMode === 'login' ? 'Welcome Back' : authMode === 'register' ? 'Join CLOUDAVI' : 'Verify Email'}
              </h2>
              
              {error && (
                <div style={{ color: 'var(--accent-red)', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(239, 68, 68, 0.2)', lineHeight: '1.4' }}>
                  <p style={{ margin: 0, fontWeight: '800' }}>Error</p>
                  <p style={{ margin: '0.25rem 0 0 0', opacity: 0.8 }}>{error}</p>
                </div>
              )}

              {authMode === 'verify' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    We've sent a verification code to:<br/><strong style={{ color: 'var(--text-primary)' }}>{user?.email}</strong>
                  </p>
                  {!otpSent ? (
                     <button onClick={handleSendOtp} disabled={loading} style={{ background: 'var(--accent-red)', color: 'white', border: 'none', padding: '1rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: 'transform 0.2s' }} onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'} onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}>
                      {loading ? 'Connecting...' : 'Send Verification Code'}
                     </button>
                  ) : (
                    <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <input 
                        type="text" placeholder="• • • • • •" required
                        value={otp} onChange={e => setOtp(e.target.value)}
                        maxLength="6"
                        style={{ padding: '1rem', borderRadius: '12px', border: '2px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none', textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '8px' }}
                      />
                      <button type="submit" disabled={loading} style={{ background: 'var(--accent-red)', color: '#fff', border: 'none', padding: '1rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
                        {loading ? 'Verifying...' : 'Verify Now'}
                      </button>
                      <button type="button" onClick={handleSendOtp} disabled={loading} style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '12px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600' }}>
                        {loading ? 'Sending...' : 'Resend OTP'}
                      </button>
                    </form>
                  )}
                  <button onClick={() => dispatch(logoutUser())} style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', marginTop: '0.5rem', fontSize: '0.9rem', textDecoration: 'underline' }}>
                    Logout and try another account
                  </button>
                </div>
              ) : (
                <>
                  <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    {authMode === 'register' && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
                        <div 
                          onClick={() => document.getElementById('avatar-input').click()}
                          style={{ 
                            width: '90px', 
                            height: '90px', 
                            borderRadius: '50%', 
                            background: 'var(--bg-secondary)', 
                            border: '2px dashed var(--accent-red)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            cursor: 'pointer',
                            overflow: 'hidden',
                            position: 'relative',
                            transition: 'all 0.3s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--accent-red)'}
                        >
                          {file ? (
                            <img src={URL.createObjectURL(file)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-primary)', fontWeight: 'bold' }}>+</div>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>AVATAR</span>
                            </div>
                          )}
                        </div>
                        <input 
                          id="avatar-input"
                          type="file" accept="image/*"
                          onChange={e => setFile(e.target.files[0])}
                          style={{ display: 'none' }}
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Click to upload profile picture</span>
                      </div>
                    )}
                    
                    {authMode === 'register' && (
                      <input 
                        type="text" placeholder="Full Name" required
                        value={fullname} onChange={e => setFullname(e.target.value)}
                        style={{ padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.2s' }}
                        onFocus={e => e.target.style.borderColor = 'var(--accent-red)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                      />
                    )}
                    <input 
                      type="email" placeholder="Email Address" required
                      value={email} onChange={e => setEmail(e.target.value)}
                      style={{ padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor = 'var(--accent-red)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                    />
                    <input 
                      type="password" placeholder="Password" required minLength="6"
                      value={password} onChange={e => setPassword(e.target.value)}
                      style={{ padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor = 'var(--accent-red)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                    />
                    <button type="submit" disabled={loading} style={{ background: 'var(--accent-red)', color: '#fff', border: 'none', padding: '1rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', marginTop: '0.5rem', fontSize: '1rem' }}>
                      {loading ? 'Processing...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
                    </button>
                  </form>

                  <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); dispatch(clearError()); }} style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>
                      {authMode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', color: 'var(--text-secondary)' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                    <span style={{ padding: '0 1rem', fontSize: '0.875rem' }}>OR CONTINUE WITH</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                    <button 
                      onClick={() => handleSocialLogin('google')} type="button" disabled={loading}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
                    >
                      <Mail size={18} color="var(--accent-red)" /> Continue with Google
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
