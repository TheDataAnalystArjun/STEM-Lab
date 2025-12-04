import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { AttendanceForm } from './components/AttendanceForm';
import { Dashboard } from './components/Dashboard';
import { AttendanceRecord, Tab } from './types';
import { getRecords, saveRecord, updateRecord } from './services/storageService';
import { Toaster } from 'react-hot-toast';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('check-in');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load records on mount and when refreshed
  useEffect(() => {
    setRecords(getRecords());
  }, [refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCheckIn = (newRecord: AttendanceRecord) => {
    saveRecord(newRecord);
    handleRefresh();
    // Ideally switch to dashboard or show success, but staying on form is often better for rapid entry
  };

  const handleCheckOut = (recordId: string, checkOutTime: string, duration: number) => {
    const recordToUpdate = records.find(r => r.id === recordId);
    if (recordToUpdate) {
      const updatedRecord = {
        ...recordToUpdate,
        checkOutTime,
        durationMinutes: duration,
        status: 'Completed' as const
      };
      updateRecord(updatedRecord);
      handleRefresh();
    }
  };

  return (
    <div className="min-h-screen text-slate-900">
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'check-in' ? (
            <AttendanceForm 
              onCheckIn={handleCheckIn} 
              onCheckOut={handleCheckOut}
              currentRecords={records}
            />
          ) : (
            <Dashboard 
              records={records} 
              onRecordsUpdate={handleRefresh}
            />
          )}
        </div>
      </Layout>
      <Toaster position="bottom-right" />
    </div>
  );
};

export default App;