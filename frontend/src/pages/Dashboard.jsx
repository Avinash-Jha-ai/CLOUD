import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DriveView from '../components/drive/DriveView';

const Dashboard = () => {
  const { user, loading } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) return null; 

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <DriveView />
    </div>
  );
};

export default Dashboard;
