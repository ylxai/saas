// app/login/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = (token: string) => {
    // Simpan token di localStorage atau cookie
    localStorage.setItem('clientToken', token);
    setIsLoggedIn(true);
    
    // Redirect ke dashboard
    router.push('/dashboard');
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <LoginForm onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}