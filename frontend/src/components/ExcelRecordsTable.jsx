import React, { useState } from 'react';
import { IconExcel, IconTrash } from './Icons';

export const ExcelRecordsTable = ({ records, classConfig, onClearTable, onDeleteRecord, onExportExcel }) => {
  const [isClearing, setIsClearing] = useState(false);

  const handleClearClick = async () => {
    if (!window.confirm("Are you sure you want to clear all records from the master mark sheet? This action cannot be undone.")) {
      return;
    }
    setIsClearing(true);
    if (onClearTable) {
      await onClearTable();
    }
    setIsClearing(false);
  };

  return (
    <div className="card">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#C8102E', fontFamily: 'Outfit, sans-serif' }}>
            Master Class Mark Sheet
          </h2>

          {classConfig && (classConfig.course_name || classConfig.batch || classConfig.exam_name) && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px', alignItems: 'center' }}>
              {classConfig.course_name && (
                <span style={{
                  backgroundColor: '#FFF0F2',
                  color: '#C8102E',
                  border: '1px solid #FFD1D6',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  padding: '3px 10px',
                  borderRadius: '6px'
                }}>
                  Course: {classConfig.course_name}
                </span>
              )}
              {classConfig.batch && (
                <span style={{
                  backgroundColor: '#F3F4F6',
                  color: '#1F2937',
                  border: '1px solid #E5E7EB',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  padding: '3px 10px',
                  borderRadius: '6px'
                }}>
                  Batch: {classConfig.batch}
                </span>
              )}
              {classConfig.exam_name && (
                <span style={{
                  backgroundColor: '#FEF3C7',
                  color: '#92400E',
                  border: '1px solid #FDE68A',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  padding: '3px 10px',
                  borderRadius: '6px'
                }}>
                  Exam: {classConfig.exam_name}
                </span>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleClearClick}
            disabled={isClearing || records.length === 0}
            className="btn-secondary"
            style={{
              fontSize: '0.85rem',
              color: records.length === 0 ? '#999' : '#EF4444',
              borderColor: records.length === 0 ? '#E5E0E0' : '#FCA5A5'
            }}
          >
            <IconTrash className={`w-4 h-4 ${isClearing ? 'animate-spin' : ''}`} />
            {isClearing ? 'Clearing...' : 'Clear Table'}
          </button>

          <button onClick={onExportExcel} className="btn-primary" style={{ fontSize: '0.85rem' }}>
            <IconExcel className="w-4 h-4" />
            Download Master Excel (.xlsx)
          </button>
        </div>
      </div>

      {records.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          backgroundColor: '#FAFAFA',
          borderRadius: '12px',
          border: '1px dashed #E5E0E0'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#FFF0F2',
            color: '#C8102E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto'
          }}>
            <IconExcel className="w-6 h-6" />
          </div>
          <p style={{ fontWeight: '600', color: '#1A1A1A' }}>No booklets scanned yet</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #E5E0E0' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.85rem',
            textAlign: 'center',
            whiteSpace: 'nowrap'
          }}>
            <thead>
              {/* Header Row 1: Merged Headers */}
              <tr style={{ backgroundColor: '#C8102E', color: 'white' }}>
                <th style={{ padding: '10px 12px', border: '1px solid #A60D25' }} rowSpan={2}>#</th>
                <th style={{ padding: '10px 14px', border: '1px solid #A60D25', textAlign: 'left' }} rowSpan={2}>Student Name</th>
                <th style={{ padding: '10px 12px', border: '1px solid #A60D25' }} rowSpan={2}>Roll No</th>
                {[...Array(10)].map((_, i) => (
                  <th key={i} colSpan={2} style={{ padding: '8px', border: '1px solid #A60D25' }}>
                    Q{i + 1}
                  </th>
                ))}
                <th style={{ padding: '10px 12px', border: '1px solid #A60D25' }} rowSpan={2}>Marks Secured</th>
                <th style={{ padding: '10px 12px', border: '1px solid #A60D25' }} rowSpan={2}>Max Marks</th>
                <th style={{ padding: '10px 12px', border: '1px solid #A60D25' }} rowSpan={2}>Action</th>
              </tr>
              {/* Header Row 2: Sub-columns a / b */}
              <tr style={{ backgroundColor: '#E63946', color: 'white' }}>
                {[...Array(10)].map((_, i) => (
                  <React.Fragment key={i}>
                    <th style={{ padding: '4px 8px', border: '1px solid #C8102E' }}>a</th>
                    <th style={{ padding: '4px 8px', border: '1px solid #C8102E' }}>b</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((rec, rIdx) => (
                <tr
                  key={rec.id || rIdx}
                  style={{ backgroundColor: rIdx % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}
                >
                  <td style={{ padding: '10px', border: '1px solid #E5E0E0', fontWeight: '700', color: '#C8102E' }}>
                    {rec.id}
                  </td>
                  <td style={{ padding: '10px 14px', border: '1px solid #E5E0E0', textAlign: 'left', fontWeight: '600' }}>
                    {rec.student_name}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #E5E0E0', fontFamily: 'monospace' }}>
                    {rec.roll_no}
                  </td>
                  {[...Array(10)].map((_, i) => {
                    const qData = rec.questions?.[String(i + 1)] || {};
                    return (
                      <React.Fragment key={i}>
                        <td style={{ padding: '6px', border: '1px solid #E5E0E0', color: qData.a ? '#1A1A1A' : '#CCC' }}>
                          {qData.a ?? '-'}
                        </td>
                        <td style={{ padding: '6px', border: '1px solid #E5E0E0', color: qData.b ? '#1A1A1A' : '#CCC' }}>
                          {qData.b ?? '-'}
                        </td>
                      </React.Fragment>
                    );
                  })}
                  <td style={{ padding: '10px', border: '1px solid #E5E0E0', fontWeight: '800', color: '#C8102E' }}>
                    {rec.marks_secured}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #E5E0E0', fontWeight: '600' }}>
                    {rec.max_marks}
                  </td>
                  <td style={{ padding: '6px 10px', border: '1px solid #E5E0E0' }}>
                    <button
                      onClick={() => onDeleteRecord(rec.id)}
                      style={{ color: '#EF4444', padding: '4px' }}
                      title="Delete Row"
                    >
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
