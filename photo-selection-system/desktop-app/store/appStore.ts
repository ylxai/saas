// store/appStore.ts
import { create } from 'zustand';
import { ProcessStatus } from '../types/processStatus';

interface AppState {
  status: ProcessStatus;
  progress: number;
  sourceFolder: string;
  targetFolder: string;
  processedCount: number;
  errors: string[];
  
  // Actions
  setStatus: (status: ProcessStatus) => void;
  setProgress: (progress: number) => void;
  setSourceFolder: (folder: string) => void;
  setTargetFolder: (folder: string) => void;
  setProcessedCount: (count: number) => void;
  setErrors: (errors: string[]) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  status: 'idle',
  progress: 0,
  sourceFolder: '',
  targetFolder: '',
  processedCount: 0,
  errors: [],
  
  setStatus: (status) => set({ status }),
  setProgress: (progress) => set({ progress }),
  setSourceFolder: (sourceFolder) => set({ sourceFolder }),
  setTargetFolder: (targetFolder) => set({ targetFolder }),
  setProcessedCount: (processedCount) => set({ processedCount }),
  setErrors: (errors) => set({ errors }),
  reset: () => set({
    status: 'idle',
    progress: 0,
    sourceFolder: '',
    targetFolder: '',
    processedCount: 0,
    errors: [],
  }),
}));