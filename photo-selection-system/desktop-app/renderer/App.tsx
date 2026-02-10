// renderer/App.tsx
import React, { useState, useEffect } from 'react';
import { ProcessStatus } from '../types/processStatus';

const App: React.FC = () => {
  const [status, setStatus] = useState<ProcessStatus>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [targetFolder, setTargetFolder] = useState<string>('');
  const [processedCount, setProcessedCount] = useState<number>(0);

  // Fungsi untuk memilih folder sumber
  const handleSelectSourceFolder = async () => {
    try {
      const folders = await window.electronAPI.openDirectory();
      if (folders && folders.length > 0) {
        setSelectedFolder(folders[0]);
      }
    } catch (error) {
      console.error('Error selecting directory:', error);
      window.electronAPI.logError('Error selecting source directory: ' + (error as Error).message);
    }
  };

  // Fungsi untuk memilih folder target
  const handleSelectTargetFolder = async () => {
    try {
      const folders = await window.electronAPI.openDirectory();
      if (folders && folders.length > 0) {
        setTargetFolder(folders[0]);
      }
    } catch (error) {
      console.error('Error selecting directory:', error);
      window.electronAPI.logError('Error selecting target directory: ' + (error as Error).message);
    }
  };

  // Fungsi untuk memulai proses
  const handleStartProcessing = async () => {
    if (!selectedFolder || !targetFolder) {
      alert('Please select both source and target folders');
      return;
    }

    setStatus('processing');
    setProgress(0);
    
    try {
      // Dalam implementasi sebenarnya, kita akan memanggil fungsi untuk memproses foto
      // berdasarkan informasi dari database
      window.electronAPI.logInfo(`Starting photo processing from ${selectedFolder} to ${targetFolder}`);
      
      // Simulasi proses
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setProgress(i);
      }
      
      setProcessedCount(10); // Misalnya 10 file diproses
      setStatus('completed');
      window.electronAPI.logInfo('Photo processing completed');
    } catch (error) {
      setStatus('error');
      window.electronAPI.logError('Error during processing: ' + (error as Error).message);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Photo Selection Desktop</h1>
        <p>Process selected photos from client into your editing folder</p>
      </header>

      <main className="app-main">
        <section className="folder-selection">
          <div className="input-group">
            <label htmlFor="source-folder">Source Folder (With RAW files):</label>
            <div className="input-with-button">
              <input
                type="text"
                id="source-folder"
                value={selectedFolder}
                readOnly
                placeholder="Select folder containing RAW files"
              />
              <button onClick={handleSelectSourceFolder}>Browse</button>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="target-folder">Target Folder (Edited photos):</label>
            <div className="input-with-button">
              <input
                type="text"
                id="target-folder"
                value={targetFolder}
                readOnly
                placeholder="Select destination folder"
              />
              <button onClick={handleSelectTargetFolder}>Browse</button>
            </div>
          </div>
        </section>

        <section className="processing-controls">
          <button 
            onClick={handleStartProcessing}
            disabled={status === 'processing' || !selectedFolder || !targetFolder}
            className="primary-button"
          >
            {status === 'processing' ? 'Processing...' : 'Start Processing'}
          </button>
        </section>

        <section className="processing-status">
          <div className="status-info">
            <h3>Processing Status</h3>
            <div className="status-indicator">
              <span className={`status-badge ${status}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
            
            {status === 'processing' && (
              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{progress}%</span>
              </div>
            )}
            
            {status === 'completed' && (
              <div className="completion-info">
                <p>Successfully processed {processedCount} photos</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>Photo Selection Desktop App v1.0</p>
      </footer>
    </div>
  );
};

export default App;