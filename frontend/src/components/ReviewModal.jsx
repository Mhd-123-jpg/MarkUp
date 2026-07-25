import React, { useState, useEffect } from 'react';
import {
  IconCheck,
  IconClose,
  IconAlertTriangle,
  IconZoomIn,
  IconZoomOut,
  IconRotate
} from './Icons';

export const ReviewModal = ({ scanResult, onSave, onDiscard, isSaving }) => {
  const [formData, setFormData] = useState(scanResult?.data || {});
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (scanResult?.data) {
      setFormData(scanResult.data);
    }
  }, [scanResult]);

  if (!scanResult) return null;

  const flags = new Set(formData.confidence_flags || []);

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubQuestionChange = (qNum, subKey, value) => {
    setFormData(prev => {
      const qObj = prev.questions?.[qNum] || { a: null, b: null, c: null };
      return {
        ...prev,
        questions: {
          ...prev.questions,
          [qNum]: {
            ...qObj,
            [subKey]: value === "" ? null : value
          }
        }
      };
    });
  };

  // Calculate live sum of sub-questions
  const calculateSubTotal = () => {
    let sum = 0;
    let count = 0;
    if (formData?.questions) {
      Object.values(formData.questions).forEach(q => {
        if (q && typeof q === 'object') {
          ['a', 'b', 'c'].forEach(sub => {
            const val = q[sub];
            if (val !== null && val !== undefined && val !== "") {
              const num = parseFloat(val);
              if (!isNaN(num)) {
                sum += num;
                count++;
              }
            }
          });
        }
      });
    }
    return { sum, count };
  };

  const { sum: subMarksSum, count: subMarksCount } = calculateSubTotal();
  const securedNum = parseFloat(formData.marks_secured || 0);
  const hasSumMismatch = subMarksCount > 0 && !isNaN(securedNum) && Math.abs(subMarksSum - securedNum) > 0.01;

  const isFieldFlagged = (fieldName) => flags.has(fieldName);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 15, 15, 0.85)',
      backdropFilter: 'blur(4px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }} className="animate-fade-in">
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '18px',
        width: '100%',
        maxWidth: '1450px',
        height: '92vh',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 24px 48px rgba(200, 16, 46, 0.2)'
      }} className="animate-slide-up">

        {/* Modal Top Bar */}
        <div style={{
          backgroundColor: '#C8102E',
          color: 'white',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '3px solid #A60D25'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              backgroundColor: 'white',
              color: '#C8102E',
              fontWeight: '800',
              padding: '2px 10px',
              borderRadius: '6px',
              fontSize: '0.85rem'
            }}>
              VERIFICATION
            </span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
              Verify & Confirm Answer Booklet Details
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {flags.size > 0 && (
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <IconAlertTriangle className="w-4 h-4" />
                {flags.size} Field(s) Require Manual Check
              </div>
            )}
            <button onClick={onDiscard} style={{ color: 'white', opacity: 0.9 }}>
              <IconClose className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Side-by-Side Body */}
        <div className="modal-review-body">
          {/* LEFT PANEL: Original Image Viewer */}
          <div className="modal-left-panel">
            {/* Image Toolbar */}
            <div style={{
              position: 'absolute',
              top: '32px',
              right: '32px',
              zIndex: 10,
              backgroundColor: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              padding: '6px 12px',
              borderRadius: '999px',
              display: 'flex',
              gap: '12px',
              color: 'white'
            }}>
              <button onClick={() => setZoom(z => Math.max(0.6, z - 0.2))} title="Zoom Out">
                <IconZoomOut className="w-5 h-5" />
              </button>
              <span style={{ fontSize: '0.85rem', lineHeight: '24px' }}>{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} title="Zoom In">
                <IconZoomIn className="w-5 h-5" />
              </button>
              <button onClick={() => setRotation(r => (r + 90) % 360)} title="Rotate">
                <IconRotate className="w-5 h-5" />
              </button>
            </div>

            <div style={{
              flex: 1,
              overflow: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #C8102E',
              borderRadius: '12px',
              backgroundColor: '#0F0F0F',
              padding: '16px'
            }}>
              <img
                src={scanResult.image_url}
                alt="Muthoot Answer Booklet Cover"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease',
                  borderRadius: '4px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
                }}
              />
            </div>

            <div style={{
              marginTop: '12px',
              textAlign: 'center',
              color: '#AAAAAA',
              fontSize: '0.8rem'
            }}>
              Muthoot Institute of Technology & Science Answer Booklet Cover
            </div>
          </div>

          {/* RIGHT PANEL: Extracted Student Details & Marks */}
          <div className="modal-right-panel">

            {/* Sum Mismatch Warning Banner */}
            {hasSumMismatch && (
              <div style={{
                backgroundColor: '#FEF2F2',
                border: '2px solid #EF4444',
                borderRadius: '12px',
                padding: '14px 18px',
                color: '#991B1B',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <IconAlertTriangle className="w-6 h-6 flex-shrink-0" style={{ marginTop: '2px', color: '#DC2626' }} />
                <div>
                  <strong style={{ fontWeight: '700' }}>Marks Sum Mismatch Warning!</strong>
                  <p style={{ marginTop: '2px' }}>
                    Sum of sub-question marks is <strong>{subMarksSum}</strong>, but boxed 'Marks Secured' is <strong>{formData.marks_secured || 0}</strong>. Please verify handwritten figures.
                  </p>
                </div>
              </div>
            )}

            {/* Primary Section: Student Name & Roll Number */}
            <div className="card" style={{ padding: '20px', borderLeft: '5px solid #C8102E' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#C8102E', marginBottom: '14px' }}>
                Student Identification
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1A1A1A' }}>
                    Student Name
                    {isFieldFlagged('student_name') && <span className="low-confidence-badge">Verify</span>}
                  </label>
                  <input
                    type="text"
                    className={`input-field ${isFieldFlagged('student_name') ? 'low-confidence-field' : ''}`}
                    style={{ fontSize: '1.05rem', fontWeight: '600', marginTop: '4px' }}
                    value={formData.student_name || ''}
                    onChange={e => handleFieldChange('student_name', e.target.value)}
                    placeholder="e.g. Arjun Prasad"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1A1A1A' }}>
                    Roll Number
                    {isFieldFlagged('roll_no') && <span className="low-confidence-badge">Verify</span>}
                  </label>
                  <input
                    type="text"
                    className={`input-field ${isFieldFlagged('roll_no') ? 'low-confidence-field' : ''}`}
                    style={{ fontSize: '1.05rem', fontWeight: '600', marginTop: '4px', fontFamily: 'monospace' }}
                    value={formData.roll_no || ''}
                    onChange={e => handleFieldChange('roll_no', e.target.value)}
                    placeholder="e.g. 02"
                  />
                </div>
              </div>
            </div>

            {/* Sub-Question Marks Grid (Q1 to Q10) */}
            <div className="card" style={{ padding: '20px', borderLeft: '5px solid #C8102E' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#C8102E' }}>
                  Sub-Question Marks Grid (Q1 to Q10)
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#666666' }}>
                  Sub-total Sum: <strong style={{ color: '#C8102E', fontSize: '0.95rem' }}>{subMarksSum}</strong>
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.88rem',
                  textAlign: 'center'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#C8102E', color: 'white' }}>
                      <th style={{ padding: '8px', border: '1px solid #A60D25' }}>Sub Q</th>
                      {[...Array(10)].map((_, i) => (
                        <th key={i} style={{ padding: '8px', border: '1px solid #A60D25', minWidth: '42px' }}>
                          Q{i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {['a', 'b', 'c'].map(subKey => (
                      <tr key={subKey} style={{ backgroundColor: subKey === 'b' ? '#FAFAFA' : '#FFFFFF' }}>
                        <td style={{ fontWeight: '700', color: '#C8102E', border: '1px solid #E5E0E0', padding: '6px' }}>
                          {subKey}
                        </td>
                        {[...Array(10)].map((_, i) => {
                          const qNum = String(i + 1);
                          const val = formData.questions?.[qNum]?.[subKey] ?? '';
                          const flagged = isFieldFlagged(`questions.${qNum}.${subKey}`);
                          return (
                            <td key={qNum} style={{ padding: '4px', border: '1px solid #E5E0E0' }}>
                              <input
                                type="text"
                                value={val === null ? '' : val}
                                onChange={e => handleSubQuestionChange(qNum, subKey, e.target.value)}
                                style={{
                                  width: '100%',
                                  height: '34px',
                                  textAlign: 'center',
                                  fontSize: '0.95rem',
                                  fontWeight: '600',
                                  border: flagged ? '2px solid #C8102E' : '1px solid #DDD',
                                  backgroundColor: flagged ? '#FFF0F2' : (val ? '#FFFFFF' : '#F9F9F9'),
                                  borderRadius: '4px',
                                  color: flagged ? '#C8102E' : '#1A1A1A'
                                }}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Marks Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="card" style={{
                padding: '18px',
                backgroundColor: isFieldFlagged('marks_secured') ? '#FFF0F2' : '#FFFFFF',
                border: isFieldFlagged('marks_secured') ? '2px solid #C8102E' : '1px solid #E5E0E0'
              }}>
                <label style={{ fontSize: '0.88rem', fontWeight: '700', color: '#C8102E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Marks Secured (Red Ink)
                  {isFieldFlagged('marks_secured') && <span className="low-confidence-badge">Check</span>}
                </label>
                <input
                  type="text"
                  className="input-field"
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: '800',
                    color: '#C8102E',
                    marginTop: '6px',
                    textAlign: 'center',
                    border: '2px solid #C8102E'
                  }}
                  value={formData.marks_secured || ''}
                  onChange={e => handleFieldChange('marks_secured', e.target.value)}
                  placeholder="e.g. 44"
                />
              </div>

              <div className="card" style={{ padding: '18px' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: '700', color: '#555555' }}>
                  Maximum Marks
                </label>
                <input
                  type="text"
                  className="input-field"
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: '800',
                    color: '#1A1A1A',
                    marginTop: '6px',
                    textAlign: 'center'
                  }}
                  value={formData.max_marks || ''}
                  onChange={e => handleFieldChange('max_marks', e.target.value)}
                  placeholder="e.g. 50"
                />
              </div>
            </div>

            {/* Secondary Academic Details (Collapsible section) */}
            <details style={{
              backgroundColor: '#FAFAFA',
              border: '1px solid #E5E0E0',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '12px'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: '600', fontSize: '0.88rem', color: '#666666' }}>
                Course & Exam Details (Semester, Branch, Course Code)
              </summary>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '600', color: '#666666' }}>Semester</label>
                  <input
                    type="text"
                    className="input-field"
                    style={{ fontSize: '0.88rem' }}
                    value={formData.semester || ''}
                    onChange={e => handleFieldChange('semester', e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '600', color: '#666666' }}>Branch</label>
                  <input
                    type="text"
                    className="input-field"
                    style={{ fontSize: '0.88rem' }}
                    value={formData.branch || ''}
                    onChange={e => handleFieldChange('branch', e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '600', color: '#666666' }}>Course Code</label>
                  <input
                    type="text"
                    className="input-field"
                    style={{ fontSize: '0.88rem' }}
                    value={formData.course_code || ''}
                    onChange={e => handleFieldChange('course_code', e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '600', color: '#666666' }}>Course Name</label>
                  <input
                    type="text"
                    className="input-field"
                    style={{ fontSize: '0.88rem' }}
                    value={formData.course_name || ''}
                    onChange={e => handleFieldChange('course_name', e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '600', color: '#666666' }}>Exam Name</label>
                  <input
                    type="text"
                    className="input-field"
                    style={{ fontSize: '0.88rem' }}
                    value={formData.exam_name || ''}
                    onChange={e => handleFieldChange('exam_name', e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '600', color: '#666666' }}>Date</label>
                  <input
                    type="text"
                    className="input-field"
                    style={{ fontSize: '0.88rem' }}
                    value={formData.date || ''}
                    onChange={e => handleFieldChange('date', e.target.value)}
                  />
                </div>
              </div>
            </details>

          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '16px 24px',
          borderTop: '1px solid #E5E0E0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button onClick={onDiscard} className="btn-secondary">
            Discard Entry
          </button>

          <button
            onClick={() => onSave(formData)}
            disabled={isSaving}
            className="btn-primary"
            style={{ fontSize: '1rem', padding: '12px 28px' }}
          >
            {isSaving ? (
              <>
                <div className="animate-spin" style={{ width: '18px', height: '18px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} />
                Saving to Excel...
              </>
            ) : (
              <>
                <IconCheck className="w-5 h-5" />
                Confirm & Save to Excel
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

function str(val) {
  return String(val);
}
