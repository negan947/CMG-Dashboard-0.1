'use client';

import { UserCircle } from 'lucide-react';

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Clients</h1>
        <p className="mt-1 text-gray-500">
          Manage your client relationships and projects.
        </p>
      </div>
      
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Your Clients</h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Add Client
          </button>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-500">Your client list will appear here.</p>
          
          <div className="flex flex-col gap-4 mt-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center p-4 border rounded-lg hover:bg-gray-50">
                <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                  <UserCircle className="h-6 w-6 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-medium">Client {i + 1}</h3>
                  <p className="text-sm text-gray-500">client{i + 1}@example.com</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 