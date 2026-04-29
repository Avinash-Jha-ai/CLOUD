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
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
    
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

      return (
        <div style={{ textAlign: 'center', color: 'white', padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '24px', border: '1px solid var(--border-color)', maxWidth: '400px' }}>
          <div style={{ marginBottom: '1rem', opacity: 0.5 }}>{getFileIcon(type, 60)}</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>No Preview Available</h3>
          <p style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '1.5rem' }}>We can't preview this {ext?.toUpperCase()} file directly.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button 
              onClick={() => handleDownload(file.url, file.fileName)}
              style={{ width: '100%', background: 'var(--accent-red)', color: 'white', padding: '0.8rem', borderRadius: '12px', fontWeight: '800', border: 'none', cursor: 'pointer' }}
            >
              Download File
            </button>
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
        style={{ zIndex: 5000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', padding: 0 }}
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="viewer-content"
          onClick={(e) => e.stopPropagation()}
          style={{ width: '100%', height: '100%', background: 'var(--bg-primary)', borderRadius: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflow: 'hidden' }}>
               <button onClick={onClose} className="action-btn-viewer" style={{ background: 'var(--bg-primary)' }}><X size={20} /></button>
               <div style={{ overflow: 'hidden' }}>
                 <h2 style={{ fontSize: '0.9rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{file.fileName}</h2>
               </div>
             </div>
             <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
               <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="action-btn-viewer"><MoreVertical size={18} /></button>
               <button onClick={() => handleDownload(file.url, file.fileName)} className="action-btn-viewer hide-mobile"><Download size={18} /></button>
             </div>
          </div>

          {/* Body */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
            {/* Left Area: Preview */}
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflow: 'hidden' }}>
              {renderReader()}
            </div>

            {/* Right Sidebar */}
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div 
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  style={{ 
                    position: isMobile ? 'absolute' : 'relative',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: isMobile ? '100%' : '350px', 
                    borderLeft: '1px solid var(--border-color)', 
                    background: 'var(--bg-secondary)', 
                    display: 'flex', 
                    flexDirection: 'column',
                    zIndex: 100
                  }}
                >
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
                          cursor: 'pointer'
                        }}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
                    {activeTab === 'summary' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Location</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9rem' }}>
                            <Folder size={14} /> My Drive
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>File Size</label>
                          <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9rem' }}>
                            {file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : `${Math.round(file.size / 1024)} KB`}
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Created</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9rem' }}>
                            <Calendar size={14} /> {new Date(file.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    )}
                    {activeTab === 'metadata' && (
                      <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <code style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                          ID: {file._id}<br/><br/>
                          TYPE: {file.fileType}
                        </code>
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button 
                       onClick={() => handleDownload(file.url, file.fileName)}
                       style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', background: 'var(--accent-red)', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                       <Download size={18} /> Download
                    </button>
                    <button 
                       onClick={() => { handleDeleteFile(file._id); onClose(); }}
                       style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-red)', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                       <Trash2 size={18} /> Delete
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
      className="container section"
      style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', position: 'relative' }}
    >
      {/* Quick Upload Box */}
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

      {/* Breadcrumbs & Actions */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        gap: '1.5rem', 
        marginBottom: '2.5rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.4rem', 
          fontSize: '1.1rem', 
          fontWeight: 'bold', 
          overflowX: 'auto', 
          paddingBottom: '0.5rem', 
          whiteSpace: 'nowrap',
          maxWidth: '100%'
        }}>
          <button onClick={() => handleBreadcrumbClick(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.1rem', fontWeight: '800' }}>
            CLOUDAVI
          </button>
          {path.map((folder, index) => (
            <React.Fragment key={folder._id}>
              <ChevronRight size={14} color="var(--text-secondary)" />
              <button onClick={() => handleBreadcrumbClick(index)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1rem' }}>
                {folder.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', width: 'auto' }}>
          <label 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--accent-red)', color: 'white', padding: '0.75rem 1rem', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
          >
            <Upload size={18} /> <span className="hide-mobile">Upload</span>
            <input type="file" multiple onChange={onFileSelect} style={{ display: 'none' }} />
          </label>
          <button 
            onClick={() => setShowFolderInput(true)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
          >
            <Plus size={18} /> <span className="hide-mobile">Folder</span>
          </button>
        </div>
      </div>

      {/* Folders Section */}
      {folders.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ marginBottom: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Folders</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))', gap: '1rem' }}>
            {folders.map((folder) => (
              <motion.div 
                key={folder._id}
                whileHover={{ y: -2 }}
                className="folder-horizontal"
                onDoubleClick={() => handleFolderClick(folder)}
                onClick={() => window.innerWidth < 768 && handleFolderClick(folder)}
              >
                <div style={{ padding: '0.5rem', background: `${folder.color}11`, borderRadius: '8px' }}>
                  <Folder size={20} color={folder.color || "var(--accent-red)"} fill={folder.color || "var(--accent-red)"} fillOpacity={0.2} />
                </div>
                <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{folder.name}</div>
                </div>
                <button 
                  className="delete-bar-overlay"
                  style={{ position: 'static', opacity: 1, width: '28px', height: '28px', borderRadius: '8px' }}
                  onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder._id); }}
                >
                  <Trash2 size={12} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Files Section (Masonry) */}
      {files.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ marginBottom: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Files</h3>
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
                  <div style={{ flex: 1, marginRight: '1rem', overflow: 'hidden' }}>
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
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {(folders.length === 0 && files.length === 0 && !isFetching) && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '10vh', gap: '1.5rem', textAlign: 'center' }}>
          <Cloud size={100} color="var(--text-secondary)" style={{ opacity: 0.2 }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Your drive is empty</h2>
          <label style={{ background: 'var(--accent-red)', color: 'white', padding: '0.8rem 2rem', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem' }}>
            Upload Files
            <input type="file" multiple onChange={onFileSelect} style={{ display: 'none' }} />
          </label>
        </div>
      )}
      <AnimatePresence>
        {selectedFile && (
          <FileViewer file={selectedFile} onClose={() => setSelectedFile(null)} />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showFolderInput && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="glass-panel"
              style={{ background: 'var(--bg-primary)', padding: '2rem 1.5rem', width: '100%', maxWidth: '450px', borderRadius: '28px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', textAlign: 'center' }}>New Folder</h3>
              <input 
                autoFocus type="text" placeholder="Folder Name" 
                value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
                style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                {folderColors.map(c => (
                  <button 
                    key={c} onClick={() => setNewFolderColor(c)}
                    style={{ height: '36px', borderRadius: '10px', background: c, border: newFolderColor === c ? '3px solid white' : 'none', cursor: 'pointer' }}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setShowFolderInput(false)} style={{ flex: 1, padding: '1rem', borderRadius: '14px', background: 'var(--bg-secondary)', border: 'none', fontWeight: '700' }}>Cancel</button>
                <button onClick={handleCreateFolder} style={{ flex: 1, padding: '1rem', borderRadius: '14px', background: 'var(--accent-red)', color: 'white', border: 'none', fontWeight: '700' }}>Create</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUploadPreview && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="glass-panel"
              style={{ background: 'var(--bg-primary)', padding: '1.5rem', width: '100%', maxWidth: '500px', borderRadius: '20px', maxHeight: '80vh', overflowY: 'auto' }}
            >
              <h3 style={{ marginBottom: '1.25rem', textAlign: 'center' }}>Upload Preview</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {selectedFiles.map((file, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '10px' }}>
                    <File size={20} color="var(--text-secondary)" />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <input 
                        type="text" 
                        value={customFileNames[i]} 
                        onChange={(e) => {
                          const newNames = [...customFileNames];
                          newNames[i] = e.target.value;
                          setCustomFileNames(newNames);
                        }}
                        style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={handleFinalUpload} style={{ flex: 1, background: 'var(--accent-red)', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '12px', fontWeight: 'bold' }}>Upload</button>
                <button onClick={() => setShowUploadPreview(false)} style={{ flex: 1, background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: 'none', padding: '0.8rem', borderRadius: '12px', fontWeight: 'bold' }}>Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isUploading && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 4000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}
          >
            <Loader2 size={48} color="var(--accent-red)" className="animate-spin" style={{ marginBottom: '1.5rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Uploading...</h2>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DriveView;
