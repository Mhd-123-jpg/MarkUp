import React from 'react';
import { IconCheck, IconAlertTriangle, IconRefresh, IconTrash } from './Icons';

export const BatchQueuePanel = ({ queue, onStartProcess, onReviewItem, onRemoveItem, isProcessing }) => {
  if (queue.length === 0) return null;

  const completedCount = queue.filter(item => item.status === 'saved').length;
  const needsReviewCount = queue.filter(item => item.status === 'needs_review').length;
  const pendingCount = queue.filter(item => item.status === 'queued' || item.status === 'scanning').length;

  const progressPercent = queue.length > 0 ? Math.round((completedCount / queue.length) * 100) : 0;

  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1A1A1A' }}>
            Booklet Processing Queue ({queue.length} items)
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#666666', marginTop: '2px' }}>
            {completedCount} saved • {needsReviewCount} ready to review • {pendingCount} queued
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {pendingCount > 0 && (
            <button
              onClick={onStartProcess}
              disabled={isProcessing}
              className="btn-primary"
              style={{ fontSize: '0.88rem' }}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} />
                  Processing Booklet OCR...
                </>
              ) : (
                <>
                  <IconRefresh className="w-4 h-4" />
                  Process Booklet Queue
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Red Progress Bar */}
      <div style={{
        height: '8px',
        backgroundColor: '#FFF0F2',
        borderRadius: '999px',
        overflow: 'hidden',
        marginBottom: '20px',
        border: '1px solid #FFD1D6'
      }}>
        <div style={{
          height: '100%',
          width: `${progressPercent}%`,
          backgroundColor: '#C8102E',
          transition: 'width 0.4s ease'
        }}></div>
      </div>

      {/* Queue Grid Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {queue.map((item, index) => {
          let badgeBg = '#FAFAFA';
          let badgeColor = '#666666';
          let statusText = 'Queued';

          if (item.status === 'scanning') {
            badgeBg = '#FFF0F2';
            badgeColor = '#C8102E';
            statusText = 'Scanning Booklet OCR...';
          } else if (item.status === 'needs_review') {
            badgeBg = '#FEF3C7';
            badgeColor = '#D97706';
            statusText = 'Ready for Review';
          } else if (item.status === 'saved') {
            badgeBg = '#F0FDF4';
            badgeColor = '#166534';
            statusText = 'Saved to Excel';
          } else if (item.status === 'error') {
            badgeBg = '#FEF2F2';
            badgeColor = '#DC2626';
            statusText = 'Scan Failed';
          }

          return (
            <div key={item.id || index} style={{
              backgroundColor: '#FFFFFF',
              border: `1px solid ${item.status === 'needs_review' ? '#D97706' : '#E5E0E0'}`,
              borderRadius: '12px',
              padding: '14px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {item.previewUrl ? (
                  <img
                    src={item.previewUrl}
                    alt="Thumbnail"
                    style={{
                      width: '50px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      border: '1px solid #E5E0E0'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '50px',
                    height: '60px',
                    backgroundColor: '#F7F5F5',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#888888',
                    fontSize: '0.75rem'
                  }}>
                    Booklet
                  </div>
                )}

                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <p style={{
                    fontWeight: '600',
                    fontSize: '0.88rem',
                    color: '#1A1A1A',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {item.file.name}
                  </p>
                  <span style={{
                    display: 'inline-block',
                    backgroundColor: badgeBg,
                    color: badgeColor,
                    fontSize: '0.72rem',
                    fontWeight: '600',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    marginTop: '4px'
                  }}>
                    {statusText}
                  </span>
                </div>

                <button
                  onClick={() => onRemoveItem(item.id)}
                  style={{ color: '#999999', padding: '4px' }}
                  title="Remove"
                >
                  <IconTrash className="w-4 h-4" />
                </button>
              </div>

              {/* Action for Item */}
              {item.status === 'needs_review' && (
                <button
                  onClick={() => onReviewItem(item)}
                  className="btn-primary"
                  style={{ width: '100%', fontSize: '0.82rem', padding: '6px 12px', justifyContent: 'center' }}
                >
                  Review & Verify Data
                </button>
              )}

              {item.status === 'saved' && (
                <div style={{
                  fontSize: '0.8rem',
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  justifyContent: 'center'
                }}>
                  <IconCheck className="w-4 h-4" />
                  Added to Master Sheet
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
