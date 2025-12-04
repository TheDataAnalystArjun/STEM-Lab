import React from 'react';
import { Monitor, List, LogIn } from 'lucide-react';
import { Tab } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Monitor className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">
                LabTrack Pro
              </span>
            </div>
            
            <nav className="flex space-x-4">
              <button
                onClick={() => onTabChange('check-in')}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                  activeTab === 'check-in'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Check In/Out
              </button>
              <button
                onClick={() => onTabChange('dashboard')}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <List className="w-4 h-4 mr-2" />
                Dashboard
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-400">
            &copy; {new Date().getFullYear()} LabTrack Pro. Secure Attendance System.
          </p>
        </div>
      </footer>
    </div>
  );
};
