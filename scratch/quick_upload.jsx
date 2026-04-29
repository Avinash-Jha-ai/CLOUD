      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          background: 'var(--bg-secondary)', 
          borderRadius: '24px', 
          padding: '2rem 1rem', 
          marginBottom: '2rem', 
          border: '2px dashed var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onClick={() => document.getElementById('quick-upload-input').click()}
      >
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%' }}>
          <Upload size={32} color="var(--accent-red)" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>Quick Upload</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Tap or drag files here</p>
        </div>
        <input 
          id="quick-upload-input"
          type="file" multiple onChange={onFileSelect} style={{ display: 'none' }} 
        />
      </motion.div>
