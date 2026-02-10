// renderer/components/PhotoProcessorControls.tsx
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { ProcessStatus } from '../../types/processStatus';

interface PhotoProcessorControlsProps {
  onProcessStart: () => void;
  onSourceFolderSelect: () => void;
  onTargetFolderSelect: () => void;
}

const PhotoProcessorControls: React.FC<PhotoProcessorControlsProps> = ({
  onProcessStart,
  onSourceFolderSelect,
  onTargetFolderSelect
}) => {
  const {
    status,
    progress,
    sourceFolder,
    targetFolder,
    processedCount,
    errors,
    setStatus,
    setProgress,
    setSourceFolder,
    setTargetFolder,
    setProcessedCount,
    setErrors
  } = useAppStore();

  return (
    <div className="processor-controls">
      <div className="folder-selection">
        <div className="input-group">
          <label htmlFor="source-folder">Source Folder (With RAW files):</label>
          <div className="input-with-button">
            <input
              type="text"
              id="source-folder"
              value={sourceFolder}
              readOnly
              placeholder="Select folder containing RAW files"
            />
            <button onClick={onSourceFolderSelect}>Browse</button>
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
            <button onClick={onTargetFolderSelect}>Browse</button>
          </div>
        </div>
      </div>

      <div className="processing-controls">
        <button 
          onClick={onProcessStart}
          disabled={status === 'processing' || !sourceFolder || !targetFolder}
          className="primary-button"
        >
          {status === 'processing' ? 'Processing...' : 'Start Processing'}
        </button>
      </div>

      <div className="processing-status">
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
          
          {errors.length > 0 && (
            <div className="error-info">
              {errors.map((error, index) => (
                <p key={index} className="error-text">{error}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoProcessorControls;