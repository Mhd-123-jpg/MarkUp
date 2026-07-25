import React from 'react';
import { IconExcel } from './Icons';

export const Header = ({ recordCount, user, onLogout, onOpenServerConfig, onExportExcel, activeTab, setActiveTab }) => {
  return (
    <header style={{
      backgroundColor: '#FFFFFF',
      borderBottom: '2px solid #C8102E',
      boxShadow: '0 2px 12px rgba(200, 16, 46, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      {/* Top Crimson Accent Bar */}
      <div style={{ height: '4px', backgroundColor: '#C8102E', width: '100%' }}></div>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: '#C8102E',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '1.4rem',
            boxShadow: '0 4px 12px rgba(200, 16, 46, 0.3)',
            fontFamily: 'Outfit, sans-serif'
          }}>
            M
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: '800',
                color: '#C8102E',
                letterSpacing: '-0.5px',
                fontFamily: 'Outfit, sans-serif',
                lineHeight: 1.1
              }}>
                Mark<span style={{ color: '#1A1A1A' }}>-UP</span>
              </h1>
              <span style={{
                backgroundColor: '#FFF0F2',
                color: '#C8102E',
                border: '1px solid #FFD1D6',
                fontSize: '0.72rem',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '999px',
                textTransform: 'uppercase'
              }}>
                MITS
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#666666', marginTop: '2px' }}>
              MITS Answer Booklet Mark Sheet Generator
            </p>
          </div>
        </div>

        {/* Navigation Tabs, Profile Pill & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Tab buttons */}
          <div style={{
            display: 'flex',
            backgroundColor: '#F7F5F5',
            padding: '4px',
            borderRadius: '10px',
            border: '1px solid #E5E0E0'
          }}>
            <button
              onClick={() => setActiveTab('scan')}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: '600',
                backgroundColor: activeTab === 'scan' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'scan' ? '#C8102E' : '#666666',
                boxShadow: activeTab === 'scan' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              Scan & Process
            </button>
            <button
              onClick={() => setActiveTab('records')}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: '600',
                backgroundColor: activeTab === 'records' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'records' ? '#C8102E' : '#666666',
                boxShadow: activeTab === 'records' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Master Sheet ({recordCount})
            </button>
          </div>

          {/* Export Excel Button */}
          <button
            onClick={onExportExcel}
            className="btn-primary"
            style={{ fontSize: '0.88rem', padding: '9px 18px' }}
          >
            <IconExcel className="w-4 h-4" />
            Download Excel
          </button>

          {/* Server Config Settings Button */}
          {onOpenServerConfig && (
            <button
              onClick={onOpenServerConfig}
              className="btn-secondary"
              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              title="Backend Server IP / Connection Settings"
            >
              ⚙️
            </button>
          )}

          {/* Teacher Profile Pill & Logout */}
          {user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#FAFAFA',
              border: '1px solid #E5E0E0',
              padding: '4px 6px 4px 12px',
              borderRadius: '999px'
            }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1A1A1A', lineHeight: 1.1 }}>
                  {user.name}
                </p>
                <p style={{ fontSize: '0.72rem', color: '#666666', marginTop: '1px' }}>
                  {user.email}
                </p>
              </div>

              <button
                onClick={onLogout}
                style={{
                  backgroundColor: '#FFF0F2',
                  color: '#C8102E',
                  border: '1px solid #FFD1D6',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  padding: '6px 12px',
                  borderRadius: '999px',
                  transition: 'all 0.2s ease'
                }}
                title="Sign out teacher account"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
