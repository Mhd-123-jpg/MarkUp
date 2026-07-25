import React, { useState, useEffect } from 'react';
import { IconCheck, IconClose } from './Icons';

export const ClassSetupModal = ({ initialData, onConfirm, onCancel }) => {
  const [courseName, setCourseName] = useState(initialData?.course_name || '');
  const [batch, setBatch] = useState(initialData?.branch || initialData?.batch || '');
  const [examType, setExamType] = useState(initialData?.exam_name || 'First Internal Examination');

  useEffect(() => {
    if (initialData) {
      if (initialData.course_name && !courseName) setCourseName(initialData.course_name);
      if ((initialData.branch || initialData.batch) && !batch) setBatch(initialData.branch || initialData.batch);
      if (initialData.exam_name && !examType) setExamType(initialData.exam_name);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!courseName.trim() || !batch.trim() || !examType.trim()) {
      alert("Please fill in Course Name, Batch, and Examination Type.");
      return;
    }
    onConfirm({
      course_name: courseName.trim(),
      batch: batch.trim(),
      exam_name: examType.trim()
    });
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
      zIndex: 150,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }} className="animate-fade-in">
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '18px',
        maxWidth: '560px',
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
            <span style={{
              backgroundColor: 'white',
              color: '#C8102E',
              fontWeight: '800',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              textTransform: 'uppercase'
            }}>
              New Table Setup
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginTop: '4px' }}>
              Class & Examination Details
            </h3>
          </div>
          {onCancel && (
            <button onClick={onCancel} style={{ color: 'white', opacity: 0.9 }}>
              <IconClose className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <p style={{ fontSize: '0.88rem', color: '#555555', lineHeight: 1.4 }}>
            First paper scan detected! Please specify the class and exam details below. These parameters will be applied across this entire class mark sheet.
          </p>

          <div>
            <label style={{ fontSize: '0.88rem', fontWeight: '700', color: '#C8102E', display: 'block', marginBottom: '6px' }}>
              COURSE NAME <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              type="text"
              className="input-field"
              style={{ fontSize: '1rem', fontWeight: '600' }}
              value={courseName}
              onChange={e => setCourseName(e.target.value)}
              placeholder="e.g. Data Structures / Artificial Neural Networks"
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.88rem', fontWeight: '700', color: '#C8102E', display: 'block', marginBottom: '6px' }}>
              BATCH / BRANCH <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              type="text"
              className="input-field"
              style={{ fontSize: '1rem', fontWeight: '600' }}
              value={batch}
              onChange={e => setBatch(e.target.value)}
              placeholder="e.g. S6 CSM / 2021-2025 CS-AI"
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.88rem', fontWeight: '700', color: '#C8102E', display: 'block', marginBottom: '6px' }}>
              EXAMINATION TYPE <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              type="text"
              className="input-field"
              style={{ fontSize: '1rem', fontWeight: '600' }}
              value={examType}
              onChange={e => setExamType(e.target.value)}
              placeholder="e.g. First Internal Examination / I.E."
              required
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            {onCancel && (
              <button type="button" onClick={onCancel} className="btn-secondary">
                Cancel
              </button>
            )}
            <button type="submit" className="btn-primary" style={{ fontSize: '0.95rem', padding: '10px 24px' }}>
              <IconCheck className="w-5 h-5" />
              Set Class Details & Continue
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
