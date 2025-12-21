/**
 * Settings Page
 */
import React from 'react';
import { Layout } from '../components/Layout';
import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  return (
    <Layout title="Settings">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">Configure your Mentora AI environment</p>
        </div>

        <div className="bg-[#151a22] border border-[#2d3748] rounded-xl p-8">
          <SettingsIcon className="mx-auto mb-4 text-slate-500" size={48} />
          <h3 className="text-lg font-medium text-white mb-2 text-center">Settings Coming Soon</h3>
          <p className="text-slate-500 text-center">Configuration options will be available here</p>
        </div>
      </div>
    </Layout>
  );
}

