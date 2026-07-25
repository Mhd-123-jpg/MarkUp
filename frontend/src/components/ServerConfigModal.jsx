import React, { useState } from 'react';
import { IconCheck, IconClose } from './Icons';
import { getBackendBaseUrl } from '../apiConfig';

export const ServerConfigModal = ({ onClose, onSave }) => {
  const [url, setUrl] = useState(getBackendBaseUrl() || 'http://192.168.137.202:8001');

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanUrl = url.trim().replace(/\/$/, '');
    localStorage.setItem('markup_backend_url', cleanUrl);
    if (onSave) onSave(cleanUrl);
    onClose();
  };

  const handleResetDefault = () => {
    localStorage.removeItem('markup_backend_url');
    setUrl('http://192.168.137.202:8001');
    if (onSave) onSave('http://192.168.137.202:8001');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 15, 15, 0.85)',
      backdropFilter: 'blur(4px)',
      zIndex: 160,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }} className="animate-fade-in">
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '18px',
        maxWidth: '520px',
        width: '100%',
        overflow: 'hidden',
        boxShadow: '0 24px 48px rgba(200, 16, 46, 0.25)'
      }} className="animate-slide-up">
        
        {/* Header */}
        <div style={{
          backgroundColor: '#C8102E',
          color: 'white',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '3px solid #A60D25'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>
              Backend Server Settings
            </h3>
            <p style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '2px' }}>
              Configure backend host IP / Cloud URL for mobile phone access
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'white', opacity: 0.9 }}>
            <IconClose className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.88rem', fontWeight: '700', color: '#1A1A1A', display: 'block', marginBottom: '6px' }}>
              Backend Server URL / Local IP
            </label>
            <input
              type="url"
              className="input-field"
              style={{ fontSize: '1rem', fontWeight: '600' }}
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="e.g. http://192.168.137.202:8001 or https://markup.railway.app"
              required
            />
            <span style={{ fontSize: '0.78rem', color: '#666666', marginTop: '6px', display: 'block' }}>
              Ensure your phone and Mac are connected to the same Wi-Fi network, or enter your hosted backend URL.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <button
              type="button"
              onClick={handleResetDefault}
              style={{ fontSize: '0.82rem', color: '#666666', textDecoration: 'underline' }}
            >
              Reset to Default IP
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                <IconCheck className="w-4 h-4" />
                Save Server URL
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
