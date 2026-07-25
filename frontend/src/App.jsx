import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { BatchQueuePanel } from './components/BatchQueuePanel';
import { ReviewModal } from './components/ReviewModal';
import { ClassSetupModal } from './components/ClassSetupModal';
import { ServerConfigModal } from './components/ServerConfigModal';
import { ExcelRecordsTable } from './components/ExcelRecordsTable';
import { TeacherAuth } from './components/TeacherAuth';
import { Toast } from './components/Toast';
import { getApiUrl, safeFetchJson } from './apiConfig';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('markup_teacher_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('scan');
  const [health, setHealth] = useState(null);
  const [records, setRecords] = useState([]);
  const [queue, setQueue] = useState([]);
  const [activeReviewItem, setActiveReviewItem] = useState(null);
  const [classConfig, setClassConfig] = useState(null); // { course_name, batch, exam_name }
  const [pendingFirstItem, setPendingFirstItem] = useState(null);
  const [showServerConfigModal, setShowServerConfigModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchHealth = async () => {
    try {
      const data = await safeFetchJson(getApiUrl('/api/health'));
      setHealth(data);
    } catch (err) {
      setHealth({ status: 'offline', gemini_api_configured: false });
    }
  };

  const fetchRecords = async (showNotification = false) => {
    try {
      const data = await safeFetchJson(getApiUrl(`/api/records?t=${Date.now()}`));
      if (data.success) {
        setRecords(data.records || []);
        if (showNotification) {
          showToast(`Master sheet loaded (${data.records?.length || 0} records).`, 'success');
        }
      }
    } catch (err) {
      console.error("Failed to fetch records:", err);
      if (showNotification) {
        showToast("Failed to connect to server. Check server settings.", 'error');
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchHealth();
      fetchRecords(false);
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('markup_teacher_user');
    setUser(null);
    showToast("Signed out successfully.", 'success');
  };

  if (!user) {
    return <TeacherAuth onLoginSuccess={(userData) => setUser(userData)} />;
  }

  // Handle files selected from upload section
  const handleFilesSelected = (files) => {
    const newItems = files.map((file, idx) => ({
      id: `${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`,
      file,
      status: 'queued',
      previewUrl: URL.createObjectURL(file),
      scanResult: null,
      errorMsg: null
    }));

    setQueue(prev => [...prev, ...newItems]);
    showToast(`Added ${files.length} booklet photo(s) to queue.`, 'success');

    // If single file, auto-start scanning immediately
    if (files.length === 1 && !isProcessing) {
      processQueueItem(newItems[0]);
    }
  };

  // Process a single item with OCR API
  const processQueueItem = async (item) => {
    setIsProcessing(true);

    setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'scanning' } : q));

    const formData = new FormData();
    formData.append('file', item.file);

    try {
      const data = await safeFetchJson(getApiUrl('/api/scan'), {
        method: 'POST',
        body: formData
      });

      if (data.success) {
        setQueue(prev => prev.map(q => q.id === item.id ? {
          ...q,
          status: 'needs_review',
          scanResult: data
        } : q));

        showToast(`Extraction complete for ${item.file.name}. Review fields before saving.`, 'success');
        
        const extractedData = data.data;

        // Check if this is the first paper of a new table (records is empty and classConfig is null)
        if (records.length === 0 && !classConfig) {
          setPendingFirstItem({
            queueId: item.id,
            image_url: data.image_url.startsWith('http') ? data.image_url : getApiUrl(data.image_url),
            data: extractedData
          });
        } else {
          // Apply active class config if present
          const mergedData = {
            ...extractedData,
            course_name: classConfig?.course_name || extractedData.course_name,
            branch: classConfig?.batch || extractedData.branch,
            exam_name: classConfig?.exam_name || extractedData.exam_name
          };

          setActiveReviewItem({
            queueId: item.id,
            image_url: data.image_url.startsWith('http') ? data.image_url : getApiUrl(data.image_url),
            data: mergedData
          });
        }
      } else {
        throw new Error(data.detail || "Scan failed");
      }
    } catch (err) {
      console.error("Scan error:", err);
      setQueue(prev => prev.map(q => q.id === item.id ? {
        ...q,
        status: 'error',
        errorMsg: err.message
      } : q));
      showToast(`Scan failed for ${item.file.name}: ${err.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Class Setup Modal Confirmation (First paper of new table)
  const handleClassConfigConfirm = (config) => {
    setClassConfig(config);

    if (pendingFirstItem) {
      const mergedData = {
        ...pendingFirstItem.data,
        course_name: config.course_name,
        branch: config.batch,
        exam_name: config.exam_name
      };

      setActiveReviewItem({
        ...pendingFirstItem,
        data: mergedData
      });
      setPendingFirstItem(null);
    }

    showToast(`Class details set for ${config.course_name} (${config.batch}).`, 'success');
  };

  // Batch process all queued items sequentially
  const handleStartBatchProcess = async () => {
    const pendingItems = queue.filter(q => q.status === 'queued' || q.status === 'error');
    if (pendingItems.length === 0) return;

    for (const item of pendingItems) {
      await processQueueItem(item);
    }
  };

  const handleRemoveQueueItem = (id) => {
    setQueue(prev => prev.filter(q => q.id !== id));
  };

  // Save confirmed review item to Master Excel
  const handleSaveConfirmedItem = async (verifiedData) => {
    setIsSaving(true);
    try {
      const data = await safeFetchJson(getApiUrl('/api/save-record'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verifiedData)
      });

      if (data.success) {
        showToast(data.message, 'success');

        if (activeReviewItem?.queueId) {
          setQueue(prev => prev.map(q => q.id === activeReviewItem.queueId ? { ...q, status: 'saved' } : q));
        }

        setActiveReviewItem(null);
        await fetchRecords(false);
      } else {
        throw new Error(data.detail || "Failed to save record");
      }
    } catch (err) {
      showToast(`Failed to save to Excel: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm(`Are you sure you want to delete Record #${id}?`)) return;
    try {
      const data = await safeFetchJson(getApiUrl(`/api/records/${id}`), { method: 'DELETE' });
      if (data.success) {
        showToast(`Record #${id} deleted from master Excel workbook.`, 'success');
        await fetchRecords(false);
      }
    } catch (err) {
      showToast(`Failed to delete record: ${err.message}`, 'error');
    }
  };

  const handleClearAllRecords = async () => {
    try {
      const data = await safeFetchJson(getApiUrl('/api/records'), { method: 'DELETE' });
      if (data.success) {
        setRecords([]);
        setClassConfig(null);
        setPendingFirstItem(null);
        showToast("Master class mark sheet cleared. Next scan will prompt for new class details.", 'success');
        await fetchRecords(false);
      } else {
        throw new Error(data.detail || "Failed to clear records");
      }
    } catch (err) {
      showToast(`Failed to clear table: ${err.message}`, 'error');
    }
  };

  const handleExportExcel = () => {
    const params = new URLSearchParams();
    if (classConfig?.course_name) params.append('course_name', classConfig.course_name);
    if (classConfig?.batch) params.append('batch', classConfig.batch);
    if (classConfig?.exam_name) params.append('exam_name', classConfig.exam_name);

    const queryString = params.toString();
    const downloadUrl = getApiUrl(`/api/export-excel${queryString ? `?${queryString}` : ''}`);
    
    let filename = 'Muthoot_Internal_Exam_Marks.xlsx';
    if (classConfig?.course_name || classConfig?.batch || classConfig?.exam_name) {
      const parts = [classConfig.course_name, classConfig.batch, classConfig.exam_name]
        .filter(Boolean)
        .map(s => s.replace(/[/\\:*?"<>| ]+/g, '_'));
      filename = `${parts.join('_')}.xlsx`;
    }

    window.location.href = downloadUrl;
    showToast(`Downloading ${filename}...`, 'success');
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header
        user={user}
        onLogout={handleLogout}
        onOpenServerConfig={() => setShowServerConfigModal(true)}
        health={health}
        recordCount={records.length}
        onExportExcel={handleExportExcel}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'scan' ? (
          <>
            <UploadSection
              onFilesSelected={handleFilesSelected}
              isProcessing={isProcessing}
            />

            <BatchQueuePanel
              queue={queue}
              onStartProcess={handleStartBatchProcess}
              onReviewItem={(item) => {
                if (!item.scanResult) return;
                const extractedData = item.scanResult.data || {};
                const mergedData = {
                  ...extractedData,
                  course_name: classConfig?.course_name || extractedData.course_name,
                  branch: classConfig?.batch || extractedData.branch,
                  exam_name: classConfig?.exam_name || extractedData.exam_name
                };
                const imgUrl = item.scanResult.image_url || '';
                setActiveReviewItem({
                  queueId: item.id,
                  image_url: imgUrl ? (imgUrl.startsWith('http') ? imgUrl : getApiUrl(imgUrl)) : '',
                  data: mergedData
                });
              }}
              onRemoveItem={handleRemoveQueueItem}
              isProcessing={isProcessing}
            />

            {/* Live Master Sheet Summary below scan */}
            <ExcelRecordsTable
              records={records}
              classConfig={classConfig}
              onClearTable={handleClearAllRecords}
              onDeleteRecord={handleDeleteRecord}
              onExportExcel={handleExportExcel}
            />
          </>
        ) : (
          <ExcelRecordsTable
            records={records}
            classConfig={classConfig}
            onClearTable={handleClearAllRecords}
            onDeleteRecord={handleDeleteRecord}
            onExportExcel={handleExportExcel}
          />
        )}
      </main>

      {/* Backend Server Settings Modal */}
      {showServerConfigModal && (
        <ServerConfigModal
          onClose={() => setShowServerConfigModal(false)}
          onSave={() => {
            fetchHealth();
            fetchRecords(false);
          }}
        />
      )}

      {/* First Paper Class Setup Modal (Prompted when table is empty) */}
      {pendingFirstItem && (
        <ClassSetupModal
          initialData={pendingFirstItem.data}
          onConfirm={handleClassConfigConfirm}
          onCancel={() => setPendingFirstItem(null)}
        />
      )}

      {/* Side-by-Side Review Verification Modal */}
      {activeReviewItem && (
        <ReviewModal
          scanResult={activeReviewItem}
          onSave={handleSaveConfirmedItem}
          onDiscard={() => setActiveReviewItem(null)}
          isSaving={isSaving}
        />
      )}

      {/* Feedback Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
