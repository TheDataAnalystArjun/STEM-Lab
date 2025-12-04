import React, { useState, useMemo } from 'react';
import { Search, Download, Filter, TrendingUp, Sparkles, X } from 'lucide-react';
import { AttendanceRecord } from '../types';
import { generateAttendanceReport } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface DashboardProps {
  records: AttendanceRecord[];
  onRecordsUpdate: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ records }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Completed'>('All');
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Filter & Sort Logic
  const filteredRecords = useMemo(() => {
    return records
      .filter(record => {
        const matchesSearch = 
          record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.systemNumber.includes(searchTerm);
        const matchesStatus = statusFilter === 'All' || record.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => b.timestamp - a.timestamp); // Newest first
  }, [records, searchTerm, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = records.length;
    const active = records.filter(r => r.status === 'Active').length;
    const completed = records.filter(r => r.status === 'Completed');
    const totalMinutes = completed.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
    const avgDuration = completed.length ? Math.round(totalMinutes / completed.length) : 0;

    return { total, active, avgDuration };
  }, [records]);

  // CSV Export
  const downloadCSV = () => {
    const headers = ['Date', 'Student Name', 'System #', 'Check In', 'Check Out', 'Duration (mins)', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredRecords.map(r => [
        r.date,
        `"${r.studentName}"`,
        r.systemNumber,
        r.checkInTime,
        r.checkOutTime || '',
        r.durationMinutes || '',
        r.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleAiAnalysis = async () => {
    setIsGeneratingAi(true);
    setAiReport(null);
    const report = await generateAttendanceReport(records);
    setAiReport(report);
    setIsGeneratingAi(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Active Students</p>
              <p className="text-3xl font-bold text-blue-600">{stats.active}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Sessions Today</p>
              <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
            </div>
            <div className="p-3 bg-slate-100 rounded-full">
              <Filter className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Avg. Duration</p>
              <p className="text-3xl font-bold text-emerald-600">{stats.avgDuration}<span className="text-sm text-slate-400 font-normal ml-1">mins</span></p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-full">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search by name or system #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select 
            className="block w-full md:w-40 pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
          </select>

          <button
            onClick={downloadCSV}
            className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          
          <button
            onClick={handleAiAnalysis}
            disabled={isGeneratingAi || records.length === 0}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isGeneratingAi ? 'Analyzing...' : 'AI Insights'}
          </button>
        </div>
      </div>

      {/* AI Report Panel */}
      {aiReport && (
        <div className="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden animation-fade-in">
           <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 flex justify-between items-center border-b border-purple-100">
             <h3 className="text-lg font-semibold text-purple-800 flex items-center">
               <Sparkles className="w-5 h-5 mr-2" />
               Daily Attendance Analysis
             </h3>
             <button onClick={() => setAiReport(null)} className="text-slate-400 hover:text-slate-600">
               <X className="w-5 h-5" />
             </button>
           </div>
           <div className="p-6 prose prose-purple max-w-none text-slate-700 text-sm">
             <ReactMarkdown>{aiReport}</ReactMarkdown>
           </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">System #</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Check In</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Check Out</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Duration</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{record.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{record.studentName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {record.systemNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{record.checkInTime}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{record.checkOutTime || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {record.durationMinutes ? `${Math.floor(record.durationMinutes / 60)}h ${record.durationMinutes % 60}m` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        record.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No records found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
