import React from 'react';
import { Layout } from '../components/Layout';
import { BarChart2, Search, Filter, Download } from 'lucide-react';
import { Button } from '../components/Button';

export default function Evaluations() {
  return (
    <Layout title="Evaluations">
      <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Evaluation History</h1>
            <p className="text-slate-400">Manage and review all historical pedagogical assessments.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" icon={Download}>Export All</Button>
            <Button icon={Filter}>Filter Resources</Button>
          </div>
        </div>

        <div className="bg-[#151a22] border border-[#2d3748] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2d3748] bg-[#1a1f28]/50 flex items-center justify-between">
            <div className="flex items-center gap-4 bg-[#0a0d12] border border-[#2d3748] rounded px-3 py-1.5 w-96">
              <Search size={16} className="text-[#64748b]" />
              <input 
                type="text" 
                placeholder="Find evaluation by ID, instructor or filename..." 
                className="bg-transparent border-none outline-none text-xs w-full py-0.5 text-[#f1f5f9]"
              />
            </div>
            <div className="text-xs text-slate-500 font-mono">Displaying 1-3 of 42 results</div>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2d3748] text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-[#0a0d12]/30">
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Evaluation ID</th>
                <th className="px-6 py-4">Instructor</th>
                <th className="px-6 py-4">Metric Score</th>
                <th className="px-6 py-4">Region</th>
                <th className="px-6 py-4 text-right">Created At</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { id: 'EVL-92384', instructor: 'Dr. Sarah Smith', score: '88.5', status: 'Completed', region: 'ap-south-1', date: '2025-12-21 14:20' },
                { id: 'EVL-92381', instructor: 'Prof. Michael Chen', score: '92.1', status: 'Completed', region: 'us-east-1', date: '2025-12-20 09:15' },
                { id: 'EVL-92375', instructor: 'Dr. Sarah Smith', score: '74.2', status: 'Completed', region: 'ap-south-1', date: '2025-12-18 11:45' },
              ].map((row) => (
                <tr key={row.id} className="border-b border-[#2d3748] hover:bg-white/[0.02] transition-colors cursor-pointer group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[#10b981] font-bold text-[10px] uppercase">
                      <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full"></span>
                      {row.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-[#1a73e8] group-hover:underline">{row.id}</td>
                  <td className="px-6 py-4 text-slate-300">{row.instructor}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className="font-bold text-white font-mono">{row.score}</span>
                       <div className="w-16 h-1 bg-[#2d3748] rounded-full overflow-hidden">
                         <div className="h-full bg-[#1a73e8]" style={{ width: `${row.score}%` }}></div>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{row.region}</td>
                  <td className="px-6 py-4 text-slate-500 text-right text-xs">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
