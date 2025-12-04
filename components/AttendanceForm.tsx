import React, { useState, useEffect } from 'react';
import { User, Hash, Clock, CheckCircle, AlertCircle, LogOut, Calendar } from 'lucide-react';
import { AttendanceRecord } from '../types';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

interface AttendanceFormProps {
  onCheckIn: (record: AttendanceRecord) => void;
  onCheckOut: (id: string, time: string, duration: number) => void;
  currentRecords: AttendanceRecord[];
}

export const AttendanceForm: React.FC<AttendanceFormProps> = ({ onCheckIn, onCheckOut, currentRecords }) => {
  const [studentName, setStudentName] = useState('');
  const [systemNumber, setSystemNumber] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mode, setMode] = useState<'check-in' | 'check-out'>('check-in');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000 * 60);
    return () => clearInterval(timer);
  }, []);

  // Determine active session for auto-switching mode or validation
  const activeSession = currentRecords.find(
    r => r.studentName.toLowerCase() === studentName.toLowerCase() && 
         r.systemNumber === systemNumber && 
         r.status === 'Active'
  );

  useEffect(() => {
    if (activeSession && mode === 'check-in') {
      // Suggest switching to check-out if an active session exists
    }
  }, [studentName, systemNumber, activeSession, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentName.trim() || !systemNumber.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    if (mode === 'check-in') {
      // Validation: Check if student is already active anywhere
      const isStudentActive = currentRecords.some(r => r.studentName.toLowerCase() === studentName.toLowerCase() && r.status === 'Active');
      if (isStudentActive) {
        toast.error(`${studentName} is already checked in! Please check out first.`);
        return;
      }

      // Validation: Check if system is occupied
      const isSystemOccupied = currentRecords.some(r => r.systemNumber === systemNumber && r.status === 'Active');
      if (isSystemOccupied) {
        toast.error(`System #${systemNumber} is currently occupied.`);
        return;
      }

      const newRecord: AttendanceRecord = {
        id: uuidv4(),
        studentName,
        systemNumber,
        date: selectedDate, // Use the selected date
        checkInTime: timeString,
        status: 'Active',
        timestamp: Date.now()
      };

      onCheckIn(newRecord);
      toast.success(`${studentName} checked in successfully at ${timeString}`);
      
      // Reset form
      setStudentName('');
      setSystemNumber('');
    } else {
      // Check Out Mode
      if (!activeSession) {
        toast.error('No active session found for this student/system combination.');
        return;
      }

      // Calculate duration
      const [inHours, inMinutes] = activeSession.checkInTime.split(':').map(Number);
      const [outHours, outMinutes] = timeString.split(':').map(Number);
      
      let durationMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes);
      // Handle day wraparound if necessary
      if (durationMinutes < 0) durationMinutes += 24 * 60;

      onCheckOut(activeSession.id, timeString, durationMinutes);
      toast.success(`${studentName} checked out. Duration: ${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`);
      
      setStudentName('');
      setSystemNumber('');
      setMode('check-in'); // Reset to default
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center">
          <h2 className="text-2xl font-bold mb-1">Lab Access Control</h2>
          <p className="text-blue-100 text-sm">
            {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <div className="mt-4 inline-flex items-center bg-blue-800 bg-opacity-50 px-3 py-1 rounded-full text-xs font-mono">
            <Clock className="w-3 h-3 mr-2" />
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Mode Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setMode('check-in')}
                className={`flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${
                  mode === 'check-in' 
                    ? 'bg-white text-blue-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Check In
              </button>
              <button
                type="button"
                onClick={() => setMode('check-out')}
                className={`flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${
                  mode === 'check-out' 
                    ? 'bg-white text-amber-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Check Out
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Student Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">System Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    value={systemNumber}
                    onChange={(e) => setSystemNumber(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g. 15"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Helper Status Message */}
            {mode === 'check-out' && studentName && systemNumber && !activeSession && (
               <div className="flex items-start p-3 bg-red-50 rounded-lg text-red-700 text-sm">
                 <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                 <span>No active session found for this student at this system.</span>
               </div>
            )}
            
            {mode === 'check-out' && activeSession && (
               <div className="flex items-start p-3 bg-green-50 rounded-lg text-green-700 text-sm">
                 <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                 <span>Active session found. Checked in at {activeSession.checkInTime}.</span>
               </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={mode === 'check-out' && !activeSession}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                mode === 'check-in'
                  ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  : 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {mode === 'check-in' ? 'Confirm Check-In' : 'Confirm Check-Out'}
            </button>
          </form>
        </div>
      </div>
      
      {/* Quick Tips */}
      <div className="mt-6 text-center text-sm text-slate-500">
        <p>Ensure system number matches the sticker on your desk.</p>
      </div>
    </div>
  );
};