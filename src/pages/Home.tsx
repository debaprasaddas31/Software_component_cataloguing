import React from 'react';
import { Package } from 'lucide-react';

export function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center py-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-xl">
        <Package className="w-16 h-16 mx-auto text-white mb-4" />
        <h1 className="text-4xl font-bold text-white mb-4">
          Software Component Catalog
        </h1>
        <p className="text-xl text-white/90 max-w-2xl mx-auto px-4">
          Discover, manage, and reuse software components across your projects
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Browse Components</h2>
          <p className="text-gray-600">
            Explore our extensive library of reusable software components, organized by categories.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Track Usage</h2>
          <p className="text-gray-600">
            Monitor component usage and popularity to make informed decisions.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Easy Integration</h2>
          <p className="text-gray-600">
            Seamlessly integrate components into your projects with detailed documentation.
          </p>
        </div>
      </div>
    </div>
  );
}