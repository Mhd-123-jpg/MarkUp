import React, { useState, useRef } from 'react';
import { IconUpload, IconCamera, IconClose } from './Icons';

export const UploadSection = ({ onFilesSelected, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  const cameraInputRef = useRef(null);

  // Live Webcam Modal logic
  const startCamera = async () => {
    // On non-HTTPS connections, navigator.mediaDevices is unavailable
    // Directly open native file picker with camera hint
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
        cameraInputRef.current.click();
      }
      return;
    }

    try {
      setShowCameraModal(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      // If getUserMedia fails, open native file picker
      setShowCameraModal(false);
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
        cameraInputRef.current.click();
      }
    }
  };

  const handleCameraFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCameraModal(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `camera_scan_${Date.now()}.jpg`, { type: 'image/jpeg' });
          onFilesSelected([file]);
          stopCamera();
        }
      }, 'image/jpeg', 0.92);
    }
  };

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
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1A1A1A' }}>
            Upload Answer Booklet Cover Page
          </h2>
        </div>

        <button
          onClick={startCamera}
          className="btn-outline-red"
          style={{ fontSize: '0.88rem' }}
        >
          <IconCamera className="w-4 h-4" />
          Live Camera Capture
        </button>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? '#C8102E' : '#E5E0E0'}`,
          backgroundColor: isDragging ? '#FFF0F2' : '#FAFAFA',
          borderRadius: '12px',
          padding: '40px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          style={{ display: 'none' }}
        />
        {/* Hidden camera input (opens native camera/file picker on mobile) */}
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleCameraFileChange}
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
        />

        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#FFF0F2',
          color: '#C8102E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <IconUpload className="w-7 h-7" />
        </div>

        <div>
          <p style={{ fontWeight: '600', color: '#1A1A1A', fontSize: '1rem' }}>
            Drag & drop booklet photos here
          </p>
          <p style={{ fontSize: '0.85rem', color: '#888888', marginTop: '4px' }}>
            or <span style={{ color: '#C8102E', textDecoration: 'underline' }}>browse from your computer</span>
          </p>
        </div>
      </div>

      {/* Camera Capture Modal */}
      {showCameraModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '700px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              padding: '16px 20px',
              backgroundColor: '#C8102E',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
                <IconCamera className="w-5 h-5" />
                Capture Booklet Photo
              </div>
              <button onClick={stopCamera} style={{ color: 'white' }}>
                <IconClose className="w-6 h-6" />
              </button>
            </div>

            <div style={{ padding: '20px', backgroundColor: '#1A1A1A', textAlign: 'center' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                  width: '100%',
                  maxHeight: '450px',
                  objectFit: 'contain',
                  borderRadius: '8px'
                }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            <div style={{
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FAFAFA'
            }}>
              <p style={{ fontSize: '0.85rem', color: '#666666' }}>
                Align the answer booklet front cover page inside the camera frame.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={stopCamera} className="btn-secondary">
                  Cancel
                </button>
                <button onClick={capturePhoto} className="btn-primary">
                  <IconCamera className="w-4 h-4" />
                  Capture Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
