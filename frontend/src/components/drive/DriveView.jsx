import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFolderContent, createFolder, uploadFiles, deleteFile, deleteFolder } from '../../features/drive/driveSlice';
import { Folder, File, Upload, Plus, Trash2, ChevronRight, Home, Cloud, Image as ImageIcon, Video as VideoIcon, Music as MusicIcon, FileText, X, Check, Loader2, Download, MoreVertical, ExternalLink, Volume2, Calendar, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DriveView = () => {
  const dispatch = useDispatch();
  const { folders, files, isFetching, isUploading, error } = useSelector((state) => state.drive);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [path, setPath] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Folder Creation State
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#ef4444');
  const [showFolderInput, setShowFolderInput] = useState(false);

  // File Upload State
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [customFileNames, setCustomFileNames] = useState([]);
  const [showUploadPreview, setShowUploadPreview] = useState(false);

  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    dispatch(fetchFolderContent(currentFolderId));
  }, [currentFolderId, dispatch]);

  const handleFolderClick = (folder) => {
    setPath([...path, folder]);
    setCurrentFolderId(folder._id);
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      setPath([]);
      setCurrentFolderId(null);
    } else {
      const newPath = path.slice(0, index + 1);
      setPath(newPath);
      setCurrentFolderId(newPath[newPath.length - 1]._id);
    }
  };

  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      dispatch(createFolder({ name: newFolderName, color: newFolderColor, parentId: currentFolderId }));
      setNewFolderName('');
      setShowFolderInput(false);
    }
  };

  const onFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedFiles(files);
      setCustomFileNames(files.map(f => f.name.split('.')[0])); 
      setShowUploadPreview(true);
    }
  };

  const handleFinalUpload = () => {
    const finalNames = selectedFiles.map((file, i) => {
      const ext = file.name.split('.').pop();
      return customFileNames[i] ? `${customFileNames[i]}.${ext}` : null;
    });

    dispatch(uploadFiles({ files: selectedFiles, customNames: finalNames, folderId: currentFolderId }));
    setShowUploadPreview(false);
    setSelectedFiles([]);
    setCustomFileNames([]);
  };

  const handleDeleteFile = (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      dispatch(deleteFile(fileId));
    }
  };

  const handleDeleteFolder = (folderId) => {
    if (window.confirm('Are you sure you want to delete this folder and all its content?')) {
      dispatch(deleteFolder(folderId));
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setSelectedFiles(files);
      setCustomFileNames(files.map(f => f.name.split('.')[0]));
      setShowUploadPreview(true);
    }
  };

  const getFileIcon = (type, size = 40) => {
    switch(type?.toLowerCase()) {
      case 'image': return <ImageIcon size={size} color="#10b981" />;
      case 'video': return <VideoIcon size={size} color="#f59e0b" />;
      case 'audio': return <MusicIcon size={size} color="#8b5cf6" />;
      case 'pdf': return <FileText size={size} color="#ef4444" />;
      default: return <File size={size} color="var(--text-secondary)" />;
    }
  };

  const handleDownload = async (url, fileName) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: just open in new tab
      window.open(url, '_blank');
    }
  };

  const FilePreview = ({ file }) => {
    const type = file.fileType?.toLowerCase();

    return (
      <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', background: 'var(--bg-secondary)', position: 'relative' }}>
        {type === 'image' ? (
          <img 
            src={file.url} alt={file.fileName} 
            style={{ width: '100%', height: 'auto', display: 'block' }} 
          />
        ) : type === 'video' ? (
          <div style={{ padding: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
            <VideoIcon size={48} color="white" />
          </div>
        ) : (
          <div style={{ padding: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {getFileIcon(type)}
          </div>
        )}
      </div>
    );
  };

  const TextReader = ({ url }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      fetch(url)
        .then(res => res.text())
        .then(text => {
          setContent(text);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to read text file:", err);
          setContent("Error loading file content.");
          setLoading(false);
        });
    }, [url]);

    if (loading) return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white' }}>
        <Loader2 className="animate-spin" size={48} />
      </div>
    );

    return (
      <div style={{ width: '100%', height: '100%', overflowY: 'auto', padding: '2rem', background: '#1e1e1e', color: '#d4d4d4', fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: '1.6', textAlign: 'left', whiteSpace: 'pre-wrap', borderRadius: '8px' }}>
        {content}
      </div>
    );
  };

  const FileViewer = ({ file, onClose }) => {
    const [activeTab, setActiveTab] = useState('summary');
    if (!file) return null;
    const type = file.fileType?.toLowerCase();
    const ext = file.fileName?.split('.').pop()?.toLowerCase();

    const renderReader = () => {
      if (type === 'image') return <img src={file.url} alt={file.fileName} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }} />;
      if (type === 'video') return <video src={file.url} controls autoPlay style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '8px' }} />;
      
      if (['txt', 'md', 'json', 'js', 'css', 'html', 'py', 'c', 'cpp'].includes(ext)) {
        return <TextReader url={file.url} />;
      }

      if (ext === 'pdf') {
        return (
          <iframe 
            src={file.url} 
            title={file.fileName} 
            style={{ width: '100%', height: '100%', border: 'none', borderRadius: '12px', background: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }} 
          />
        );
      }

      if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) {
        return (
          <iframe 
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}&embedded=true`} 
            title={file.fileName} 
            style={{ width: '100%', height: '100%', border: 'none', borderRadius: '12px', background: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }} 
          />
        );
      }

      return (
        <div style={{ textAlign: 'center', color: 'white', padding: '3rem', background: 'var(--bg-secondary)', borderRadius: '24px', border: '1px solid var(--border-color)', maxWidth: '400px' }}>
          <div style={{ marginBottom: '1.5rem', opacity: 0.5 }}>{getFileIcon(type, 80)}</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>No Preview Available</h3>
          <p style={{ fontSize: '0.9rem', opacity: 0.6, marginBottom: '2rem' }}>We can't preview this {ext?.toUpperCase()} file directly.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button 
              onClick={() => handleDownload(file.url, file.fileName)}
              style={{ width: '100%', background: 'var(--accent-red)', color: 'white', padding: '0.8rem', borderRadius: '12px', fontWeight: '800', border: 'none', cursor: 'pointer' }}
            >
              Download File
            </button>
            <a href={file.url} target="_blank" rel="noreferrer" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', color: 'white', padding: '0.8rem', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', border: '1px solid var(--border-color)' }}>
               Open in New Tab <ExternalLink size={14} />
            </a>
          </div>
        </div>
      );
    };

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="viewer-overlay"
        onClick={onClose}
        style={{ zIndex: 5000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="viewer-content"
          onClick={(e) => e.stopPropagation()}
          style={{ width: '95vw', height: '90vh', background: 'var(--bg-primary)', borderRadius: '32px', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <div style={{ background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '10px', display: 'flex' }}>
                 {getFileIcon(type, 20)}
               </div>
               <div>
                 <h2 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>{file.fileName}</h2>
                 <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--accent-red)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {currentPath.length > 0 ? currentPath[currentPath.length-1].name : 'My Drive'}
                 </span>
               </div>
             </div>
             <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
               {['txt', 'md', 'json', 'js', 'css', 'html'].includes(ext) && (
                 <button 
                   className="action-btn-viewer" 
                   onClick={() => {
                     const synth = window.speechSynthesis;
                     if (synth.speaking) {
                       synth.cancel();
                     } else {
                       fetch(file.url).then(res => res.text()).then(text => {
                         const utterance = new SpeechSynthesisUtterance(text);
                         synth.speak(utterance);
                       });
                     }
                   }}
                   title="Read Aloud"
                   style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-red)' }}
                 >
                   <Volume2 size={18} />
                 </button>
               )}
               <button onClick={() => handleDownload(file.url, file.fileName)} className="action-btn-viewer"><Download size={18} /></button>
               <button onClick={() => { handleDeleteFile(file._id); onClose(); }} className="action-btn-viewer" style={{ color: 'var(--accent-red)' }}><Trash2 size={18} /></button>
               <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 0.5rem' }}></div>
               <button className="action-btn-viewer" onClick={onClose} style={{ background: 'var(--bg-primary)' }}><X size={20} /></button>
             </div>
          </div>

          {/* Body */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Left Area: Preview */}
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {renderReader()}
              </div>
            </div>

            {/* Right Sidebar */}
            <div style={{ width: '350px', borderLeft: '1px solid var(--border-color)', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
                {['summary', 'metadata', 'analysis'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      flex: 1,
                      padding: '1rem',
                      background: activeTab === tab ? 'var(--bg-primary)' : 'transparent',
                      border: 'none',
                      color: activeTab === tab ? 'var(--accent-red)' : 'var(--text-secondary)',
                      fontWeight: '800',
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div layoutId="tab-underline" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'var(--accent-red)' }} />
                    )}
                  </button>
                ))}
              </div>

              <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                <AnimatePresence mode="wait">
                  {activeTab === 'summary' && (
                    <motion.div
                      key="summary"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                    >
                      <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Location</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                          <Folder size={16} /> {currentPath.length > 0 ? currentPath[currentPath.length-1].name : 'My Drive'}
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Format</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                          <FileText size={16} /> {ext?.toUpperCase() || 'UNKNOWN'}
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>File Size</label>
                        <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                          {file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : `${Math.round(file.size / 1024)} KB`}
                        </div>
                      </div>
                      <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.5rem 0' }}></div>
                      <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Created</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9rem' }}>
                          <Calendar size={14} /> {new Date(file.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'metadata' && (
                    <motion.div
                      key="metadata"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <code style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                          ID: {file._id}<br/><br/>
                          TYPE: {file.fileType}<br/><br/>
                          URL: {file.url.substring(0, 40)}...
                        </code>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'analysis' && (
                    <motion.div
                      key="analysis"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                    >
                      <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: '800', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                           <Shield size={16} /> SECURITY CHECK
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0 }}>This file is verified and safe for delivery.</p>
                      </div>
                      <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6', fontWeight: '800', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                           <Zap size={16} /> PERFORMANCE
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0 }}>Optimized for fast previewing and low latency access.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sidebar Footer */}
              <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                <button 
                   onClick={() => handleDownload(file.url, file.fileName)}
                   style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'var(--accent-red)', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                   <Download size={18} /> Download File
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const folderColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ padding: '2rem', minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', position: 'relative' }}
    >
      {/* Uploading Overlay */}
      <AnimatePresence>
        {isUploading && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 4000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.div 
              animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              style={{ marginBottom: '2rem' }}
            >
              <Loader2 size={64} color="var(--accent-red)" />
            </motion.div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>Uploading your files...</h2>
            <div style={{ width: '300px', height: '6px', background: 'var(--bg-secondary)', borderRadius: '10px', overflow: 'hidden' }}>
              <motion.div 
                animate={{ x: ['-100%', '100%'] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                style={{ width: '100%', height: '100%', background: 'var(--accent-red)' }}
              />
            </div>
            <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)' }}>Please do not close this window</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag & Drop Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(239, 68, 68, 0.1)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', border: '4px dashed var(--accent-red)', margin: '1rem', boxSizing: 'border-box', borderRadius: '24px' }}
          >
            <Cloud size={100} color="var(--accent-red)" style={{ marginBottom: '1.5rem' }} />
            <h2 style={{ color: 'var(--accent-red)', fontWeight: '800', fontSize: '2rem' }}>Drop files to upload</h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Preview Modal */}
      <AnimatePresence>
        {showUploadPreview && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="glass-panel"
              style={{ background: 'var(--bg-primary)', padding: '2rem', width: '100%', maxWidth: '500px', borderRadius: '20px', maxHeight: '80vh', overflowY: 'auto' }}
            >
              <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Confirm Upload Names</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                {selectedFiles.map((file, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '12px' }}>
                    <File size={24} color="var(--text-secondary)" />
                    <div style={{ flex: 1 }}>
                      <input 
                        type="text" 
                        value={customFileNames[i]} 
                        placeholder="Random name will be used"
                        onChange={(e) => {
                          const newNames = [...customFileNames];
                          newNames[i] = e.target.value;
                          setCustomFileNames(newNames);
                        }}
                        style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.9rem' }}
                      />
                      <small style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Original: {file.name}</small>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={handleFinalUpload} style={{ flex: 1, background: 'var(--accent-red)', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Upload All</button>
                <button onClick={() => setShowUploadPreview(false)} style={{ flex: 1, background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.8rem', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Upload Box */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          background: 'var(--bg-secondary)', 
          borderRadius: '24px', 
          padding: '2rem', 
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
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-red)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
      >
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%' }}>
          <Upload size={32} color="var(--accent-red)" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>Quick Upload</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Drag and drop files here or click to browse</p>
        </div>
        <input 
          id="quick-upload-input"
          type="file" multiple onChange={onFileSelect} style={{ display: 'none' }} 
        />
      </motion.div>

      {/* Breadcrumbs & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
          <button onClick={() => handleBreadcrumbClick(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem', fontWeight: '800' }}>
            CLOUDAVI
          </button>
          {path.map((folder, index) => (
            <React.Fragment key={folder._id}>
              <ChevronRight size={18} color="var(--text-secondary)" />
              <button onClick={() => handleBreadcrumbClick(index)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.1rem' }}>
                {folder.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <label 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent-red)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }}
          >
            <Upload size={20} /> Upload Files
            <input type="file" multiple onChange={onFileSelect} style={{ display: 'none' }} />
          </label>
          <button 
            onClick={() => setShowFolderInput(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s' }}
          >
            <Plus size={20} /> New Folder
          </button>
        </div>
      </div>

      {/* New Folder Modal */}
      <AnimatePresence>
        {showFolderInput && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="glass-panel"
              style={{ background: 'var(--bg-primary)', padding: '2.5rem', width: '100%', maxWidth: '450px', borderRadius: '28px', display: 'flex', flexDirection: 'column', gap: '2rem' }}
            >
              <div style={{ textAlign: 'center' }}>
                <motion.div 
                  animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3 }}
                  style={{ display: 'inline-flex', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '24px', marginBottom: '1.25rem', boxShadow: `0 10px 30px ${newFolderColor}22` }}
                >
                  <Folder size={64} color={newFolderColor} fill={newFolderColor} fillOpacity={0.2} />
                </motion.div>
                <h3 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.5px' }}>New Folder</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem' }}>Organize your files with style</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>FOLDER NAME</label>
                  <input 
                    autoFocus type="text" placeholder="e.g. Work Documents" 
                    value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
                    style={{ width: '100%', padding: '1.1rem', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none', fontSize: '1.05rem', transition: 'border-color 0.2s' }}
                    onFocus={(e) => e.target.style.borderColor = newFolderColor}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>THEME COLOR</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    {folderColors.map(c => (
                      <motion.button 
                        key={c} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => setNewFolderColor(c)}
                        style={{ height: '42px', borderRadius: '12px', background: c, border: newFolderColor === c ? '3px solid white' : 'none', cursor: 'pointer', transition: 'all 0.2s', boxShadow: newFolderColor === c ? `0 6px 15px ${c}66` : 'none', position: 'relative' }}
                      >
                        {newFolderColor === c && <motion.div layoutId="check" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}><Check size={18} color="white" /></motion.div>}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button onClick={() => setShowFolderInput(false)} style={{ flex: 1, background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '1.1rem', borderRadius: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}>Cancel</button>
                <button onClick={handleCreateFolder} style={{ flex: 1, background: 'var(--accent-red)', color: 'white', border: 'none', padding: '1.1rem', borderRadius: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4)', transition: 'all 0.2s' }}>Create</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Folders Section */}
      {folders.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Folders</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {folders.map((folder) => (
              <motion.div 
                key={folder._id}
                whileHover={{ y: -2 }}
                className="folder-horizontal"
                onDoubleClick={() => handleFolderClick(folder)}
              >
                <div style={{ padding: '0.5rem', background: `${folder.color}11`, borderRadius: '8px' }}>
                  <Folder size={24} color={folder.color || "var(--accent-red)"} fill={folder.color || "var(--accent-red)"} fillOpacity={0.2} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{folder.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>in CLOUDAVI</div>
                </div>
                <button 
                  className="delete-bar-overlay"
                  style={{ position: 'static', opacity: 1, width: '28px', height: '28px' }}
                  onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder._id); }}
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Files Section (Masonry) */}
      {files.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Files</h3>
          <div className="masonry-grid">
            {files.map((file) => (
              <motion.div 
                key={file._id}
                className="file-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ position: 'relative', cursor: 'pointer' }}
                onClick={() => setSelectedFile(file)}
              >
                <div className="file-info-header">
                  <div style={{ flex: 1, marginRight: '1rem' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: '800', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.fileName}</h4>
                    <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>{file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`}</span>
                  </div>
                </div>

                <FilePreview file={file} />

                <button 
                  className="delete-bottom-reveal-bar"
                  onClick={(e) => { e.stopPropagation(); handleDeleteFile(file._id); }}
                >
                  <Trash2 size={16} /> Delete
                </button>

                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', zIndex: 110 }}>
                  {file.fileType}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {(folders.length === 0 && files.length === 0 && !isFetching) && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '10vh', gap: '2rem' }}>
          <Cloud size={160} color="var(--text-secondary)" style={{ opacity: 0.2 }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Nothing here yet</h2>
          <label style={{ background: 'var(--accent-red)', color: 'white', padding: '0.75rem 2rem', borderRadius: '12px', cursor: 'pointer', fontWeight: '700' }}>
            Select files to upload
            <input type="file" multiple onChange={onFileSelect} style={{ display: 'none' }} />
          </label>
        </div>
      )}
      <AnimatePresence>
        {selectedFile && (
          <FileViewer file={selectedFile} onClose={() => setSelectedFile(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DriveView;
