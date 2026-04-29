import React from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { Shield, Zap, Cloud, CheckCircle, Code, Server, FolderUp } from 'lucide-react';
import { loginWithGoogle } from '../features/auth/authSlice';

const Home = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleStartForFree = () => {
    dispatch(loginWithGoogle());
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const PricingCard = ({ title, price, features, isPopular }) => (
    <motion.div 
      variants={itemVariants}
      whileHover={{ scale: 1.02, translateY: -5 }}
      className="glass-panel"
      style={{ padding: '2rem', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', border: isPopular ? '2px solid var(--accent-red)' : '1px solid var(--border-color)', height: '100%' }}
    >
      {isPopular && <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--accent-red)', color: 'white', padding: '0.25rem 2rem', fontSize: '0.75rem', fontWeight: 'bold', transform: 'rotate(45deg) translate(25%, -50%)' }}>POPULAR</div>}
      <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{title}</h3>
      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
        ₹{price}<span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>/mo</span>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
        {features.map((feature, idx) => (
          <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
            <CheckCircle size={16} color="var(--accent-red)" /> {feature}
          </li>
        ))}
      </ul>
      <button style={{ marginTop: '2rem', width: '100%', padding: '0.75rem', borderRadius: '8px', border: isPopular ? 'none' : '1px solid var(--border-color)', background: isPopular ? 'var(--accent-red)' : 'transparent', color: isPopular ? 'white' : 'var(--text-primary)', cursor: 'pointer', fontWeight: 'bold' }}>
        Get Started
      </button>
    </motion.div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      
      {/* Hero Section */}
      <section className="section" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', width: '100%' }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ maxWidth: '800px', width: '100%' }}>
          <motion.div variants={itemVariants} style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'var(--bg-secondary)', borderRadius: '20px', color: 'var(--accent-red)', fontWeight: 'bold', marginBottom: '1.5rem', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
            Version 2.0 is live 🚀
          </motion.div>
          <motion.h1 variants={itemVariants} style={{ fontSize: 'var(--hero-font-size)', fontWeight: '900', marginBottom: '1.5rem', background: 'linear-gradient(to right, var(--text-primary), var(--accent-red))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1 }}>
            {user ? `Welcome Back, ${user.fullname.split(' ')[0]}` : 'The Future of Cloud Storage'}
          </motion.h1>
          <motion.p variants={itemVariants} style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
            Store, sync, and share your files with military-grade encryption. Experience the fastest and most secure way to manage your digital life.
          </motion.p>
          <motion.div variants={itemVariants} style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {!user && <button onClick={handleStartForFree} style={{ background: 'var(--accent-red)', color: 'white', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Start for free</button>}
            <button style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', border: '1px solid var(--border-color)', cursor: 'pointer' }}>View Documentation</button>
          </motion.div>
        </motion.div>
      </section>

      {/* Why Use Our Product */}
      <section className="section" style={{ background: 'var(--bg-secondary)', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Why Choose CLOUDAVI?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>Built for developers and professionals who need uncompromising speed and security.</p>
          </div>
          
          <motion.div 
            variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}
          >
            {[
              { icon: <Shield size={32} color="var(--accent-red)" />, title: 'End-to-End Encryption', desc: 'Your files are encrypted before they leave your device. Only you hold the keys.' },
              { icon: <Zap size={32} color="var(--accent-red)" />, title: 'Global Edge Network', desc: 'We route your files through the fastest global nodes for instant access anywhere.' },
              { icon: <FolderUp size={32} color="var(--accent-red)" />, title: 'Seamless Sync', desc: 'Changes made on one device instantly reflect everywhere without conflicts.' },
            ].map((feature, idx) => (
              <motion.div key={idx} variants={itemVariants} className="glass-panel" style={{ padding: '2rem', background: 'var(--bg-primary)' }}>
                <div style={{ background: 'var(--bg-secondary)', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{feature.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Documentation Snapshot */}
      <section className="section" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', alignItems: 'center' }}>
          <div style={{ flex: '1 1 300px' }}>
            <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Developer First</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '2rem', lineHeight: 1.6 }}>
              Integrate CLOUDAVI into your apps in minutes. Our comprehensive REST API and SDKs make it incredibly easy to manage files programmatically.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-primary)' }}><Code color="var(--accent-red)" /> <span>REST API & GraphQL Support</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-primary)' }}><Server color="var(--accent-red)" /> <span>Dedicated Backend SDKs</span></div>
            </div>
            <button style={{ marginTop: '2rem', background: 'transparent', color: 'var(--accent-red)', border: 'none', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Read the Docs →</button>
          </div>
          <div className="glass-panel" style={{ flex: '1 1 400px', padding: '1.5rem', background: '#1e1e1e', borderRadius: '16px', color: '#d4d4d4', fontFamily: 'monospace', fontSize: '0.85rem', overflowX: 'auto', width: '100%' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }}></div>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }}></div>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }}></div>
            </div>
            <pre style={{ margin: 0 }}>
              <code>
<span style={{ color: '#569cd6' }}>import</span> {'{'} CloudClient {'}'} <span style={{ color: '#569cd6' }}>from</span> <span style={{ color: '#ce9178' }}>'@cloudavi/sdk'</span>;{'\n\n'}
<span style={{ color: '#569cd6' }}>const</span> client = <span style={{ color: '#569cd6' }}>new</span> CloudClient(<span style={{ color: '#ce9178' }}>'API_KEY'</span>);{'\n\n'}
<span style={{ color: '#6a9955' }}>// Upload a file easily</span>{'\n'}
<span style={{ color: '#569cd6' }}>await</span> client.files.upload({'\n'}
{'  '}path: <span style={{ color: '#ce9178' }}>'/documents/report.pdf'</span>,{'\n'}
{'  '}data: fileStream{'\n'}
{'});'}
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="section" style={{ background: 'var(--bg-secondary)', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Simple, Transparent Pricing</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>No hidden fees. Cancel anytime.</p>
          </div>
          
          <motion.div 
            variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}
          >
            <PricingCard title="Free" price="1" features={['1 GB Storage', 'Basic Support', 'Community Access']} isPopular={false} />
            <PricingCard title="Pro" price="50" features={['2 GB Storage', 'Priority Support', 'Advanced Sharing', 'API Access']} isPopular={true} />
            <PricingCard title="Premium" price="100" features={['5 GB Storage', '24/7 Phone Support', 'Custom Domain', 'Team Collaboration']} isPopular={false} />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '3rem var(--container-padding)', width: '100%', textAlign: 'center', borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        <p>© {new Date().getFullYear()} CLOUDAVI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
