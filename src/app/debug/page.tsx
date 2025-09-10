"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugPage() {
  const [clientInfo, setClientInfo] = useState<{
    origin: string;
    hostname: string;
    href: string;
    userAgent: string;
    timestamp: string;
  } | null>(null);

  useEffect(() => {
    setClientInfo({
      origin: window.location.origin,
      hostname: window.location.hostname,
      href: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
  }, []);

  const serverEnvVars = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    // Don't expose sensitive env vars in client
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Debug Information</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(clientInfo, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Public Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(serverEnvVars, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auth Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <button 
                onClick={() => {
                  fetch('/api/auth/session')
                    .then(res => res.json())
                    .then(data => {
                      console.log('Session test:', data);
                      alert('Check console for session data');
                    })
                    .catch(err => {
                      console.error('Session test error:', err);
                      alert('Session test failed - check console');
                    });
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Test Session Endpoint
              </button>
              
              <button 
                onClick={() => {
                  fetch('/api/auth/sign-up', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email: 'test@example.com',
                      password: 'test123',
                      name: 'Test User'
                    })
                  })
                    .then(res => res.text())
                    .then(data => {
                      console.log('Signup test response:', data);
                      alert('Check console for signup test response');
                    })
                    .catch(err => {
                      console.error('Signup test error:', err);
                      alert('Signup test failed - check console for details');
                    });
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Test Signup Endpoint
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}