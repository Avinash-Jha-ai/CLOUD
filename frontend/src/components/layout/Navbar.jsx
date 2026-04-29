import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toggleTheme } from '../../features/theme/themeSlice';
import { loginWithGoogle, logoutUser, clearError } from '../../features/auth/authSlice';
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
  const { user, loading, error } = useSelector((state) => state.auth);
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleSocialLogin = () => {
    dispatch(loginWithGoogle());
  };

  const closeAndClear = () => {
    setShowLoginModal(false);
    dispatch(clearError());
  };

  useEffect(() => {
    if (user) {
      setShowLoginModal(false);
    }
  }, [user]);

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const NavLinks = ({ mobile = false }) => (
    <>
      <Link 
        to="/" 
        onClick={() => setIsMobileMenuOpen(false)}
        style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '600', fontSize: '0.95rem', transition: 'color 0.2s', padding: mobile ? '1rem 0' : '0' }}
      >
        Home
      </Link>
      <a 
        href="/#pricing" 
        onClick={() => setIsMobileMenuOpen(false)}
        style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '600', fontSize: '0.95rem', transition: 'color 0.2s', padding: mobile ? '1rem 0' : '0' }}
      >
        Pricing
      </a>
      {user && (
        <Link 
          to="/dashboard"
          onClick={() => setIsMobileMenuOpen(false)}
          style={{ color: mobile ? 'var(--text-primary)' : 'var(--accent-red)', textDecoration: 'none', fontWeight: '700', fontSize: '0.95rem', background: mobile ? 'transparent' : 'rgba(239, 68, 68, 0.1)', padding: mobile ? '1rem 0' : '0.5rem 1rem', borderRadius: '12px' }}
        >
          Dashboard
        </Link>
      )}
    </>
  );

  return (
    <>
      <nav style={{ 
        padding: '1rem var(--container-padding)', 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center', 
        borderBottom: '1px solid var(--border-color)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000,
        background: 'var(--bg-primary)',
        width: '100%'
      }} className="glass-panel">
        
        {/* Logo - Always Left on Mobile, Center on Desktop if needed but Flex is better */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            className="show-mobile"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: 0 }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ width: '20px', height: '2px', background: 'var(--text-primary)' }}></div>
              <div style={{ width: '15px', height: '2px', background: 'var(--text-primary)' }}></div>
              <div style={{ width: '20px', height: '2px', background: 'var(--text-primary)' }}></div>
            </div>}
          </button>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--accent-red)', letterSpacing: '-1px' }}
            >
               CLOUDAVI
            </motion.div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hide-mobile" style={{ gap: '2.5rem', alignItems: 'center' }}>
          <NavLinks />
        </div>

        {/* Right Section: Theme & Auth */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={() => dispatch(toggleTheme())}
            style={{ background: 'var(--bg-secondary)', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '12px' }}
          >
            {themeMode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user ? (
            <div style={{ position: 'relative' }}>
              <motion.div 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: 'var(--bg-secondary)', padding: '0.35rem 0.5rem', borderRadius: '100px', border: '1px solid var(--border-color)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <img 
                  src={user.avatar} 
                  alt="Avatar" 
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-red)' }} 
                />
                <span className="hide-mobile" style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--text-primary)' }}>{user.fullname?.split(' ')[0] || 'User'}</span>
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
                        <Zap size={16} fill="white" /> Upgrade
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
              onClick={() => { setShowLoginModal(true); }}
              style={{ 
                background: 'var(--accent-red)', 
                color: '#fff', 
                border: 'none', 
                padding: '0.6rem 1.25rem', 
                borderRadius: '12px', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                fontWeight: '800',
                fontSize: '0.85rem',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
              }}
            >
              <LogIn size={16} /> <span className="hide-mobile">Sign In</span>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: '70px',
              left: 0,
              width: '100%',
              background: 'var(--bg-primary)',
              zIndex: 999,
              padding: '2rem var(--container-padding)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}
          >
            <NavLinks mobile />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLoginModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="glass-panel"
              style={{ background: 'var(--bg-primary)', padding: '2.5rem', width: '100%', maxWidth: '400px', borderRadius: '32px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', textAlign: 'center' }}
            >
              <button 
                onClick={closeAndClear}
                style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'var(--bg-secondary)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
              
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ width: '60px', height: '60px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <LogIn size={30} color="var(--accent-red)" />
                </div>
                <h2 style={{ color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                  Welcome to CLOUDAVI
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  Please sign in to access your secure storage
                </p>
              </div>
              
              {error && (
                <div style={{ color: 'var(--accent-red)', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(239, 68, 68, 0.2)', lineHeight: '1.4' }}>
                  <p style={{ margin: 0, fontWeight: '800' }}>Authentication Error</p>
                  <p style={{ margin: '0.25rem 0 0 0', opacity: 0.8 }}>{error}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                <button 
                  onClick={handleSocialLogin} type="button" disabled={loading}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.75rem', 
                    background: 'var(--text-primary)', 
                    color: 'var(--bg-primary)', 
                    border: 'none', 
                    padding: '1rem', 
                    borderRadius: '14px', 
                    cursor: 'pointer', 
                    fontWeight: '700',
                    fontSize: '1rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {loading ? (
                    'Signing in...'
                  ) : (
                    <>
                      <Mail size={20} /> Continue with Google
                    </>
                  )}
                </button>
              </div>
              
              <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                By signing in, you agree to our Terms of Service and Privacy Policy.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
