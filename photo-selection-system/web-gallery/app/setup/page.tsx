// app/setup/page.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/Button';

export default function SetupPage() {
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupStatus, setSetupStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleSetup = async () => {
    setIsSettingUp(true);
    setSetupStatus(null);

    try {
      const response = await fetch('/api/setup');
      const result = await response.json();

      if (result.success) {
        setSetupStatus({ success: true, message: result.message });
      } else {
        setSetupStatus({ success: false, message: result.error });
      }
    } catch (error) {
      setSetupStatus({ 
        success: false, 
        message: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
    } finally {
      setIsSettingUp(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Database Setup
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Initialize the database schema for the photo selection gallery
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <Button
              onClick={handleSetup}
              disabled={isSettingUp}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSettingUp ? 'Initializing...' : 'Initialize Database Schema'}
            </Button>

            {setupStatus && (
              <div className={`rounded-md p-4 ${setupStatus.success ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {setupStatus.success ? (
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${setupStatus.success ? 'text-green-800' : 'text-red-800'}`}>
                      {setupStatus.success ? 'Success' : 'Error'}
                    </h3>
                    <div className={`mt-2 text-sm ${setupStatus.success ? 'text-green-700' : 'text-red-700'}`}>
                      <p>{setupStatus.message}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">What this does:</h3>
              <ul className="mt-2 text-sm text-gray-500 list-disc pl-5 space-y-1">
                <li>Creates necessary tables in your database</li>
                <li>Sets up relationships between entities</li>
                <li>Creates indexes for better performance</li>
                <li>Prepares the system for storing events, photos, and selections</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}