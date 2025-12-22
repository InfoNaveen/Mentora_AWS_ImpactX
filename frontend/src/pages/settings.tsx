/**
 * Settings Page
 * Institutional metadata configuration
 */
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { storageService, InstitutionalMetadata } from '../lib/storage';
import { Settings as SettingsIcon, Save, Building2, User, BookOpen } from 'lucide-react';

export default function Settings() {
  const [metadata, setMetadata] = useState<InstitutionalMetadata>({
    institutionName: '',
    instructorName: '',
    subjectCode: '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const saved = storageService.getInstitutionalMetadata();
    if (saved) {
      setMetadata(saved);
    }
  }, []);

  const handleSave = () => {
    storageService.saveInstitutionalMetadata(metadata);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Layout title="Settings">
      <div className="max-w-2xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">Configure institutional metadata for evaluation reports</p>
        </div>

        <div className="bg-[#151a22] border border-[#2d3748] rounded-xl p-8 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <SettingsIcon className="text-[#1a73e8]" size={24} />
            <h2 className="text-xl font-semibold text-white">Institutional Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                <Building2 size={16} />
                Institution Name
              </label>
              <input
                type="text"
                value={metadata.institutionName}
                onChange={(e) => setMetadata({ ...metadata, institutionName: e.target.value })}
                className="w-full bg-[#0a0d12] border border-[#2d3748] rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] outline-none"
                placeholder="e.g., University of Technology"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                <User size={16} />
                Instructor Name
              </label>
              <input
                type="text"
                value={metadata.instructorName}
                onChange={(e) => setMetadata({ ...metadata, instructorName: e.target.value })}
                className="w-full bg-[#0a0d12] border border-[#2d3748] rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] outline-none"
                placeholder="e.g., Dr. Jane Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                <BookOpen size={16} />
                Subject Code
              </label>
              <input
                type="text"
                value={metadata.subjectCode}
                onChange={(e) => setMetadata({ ...metadata, subjectCode: e.target.value })}
                className="w-full bg-[#0a0d12] border border-[#2d3748] rounded-lg px-4 py-2 text-slate-200 font-mono focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] outline-none"
                placeholder="e.g., CS101"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#2d3748]">
            {saved && (
              <span className="text-sm text-[#10b981] flex items-center gap-2">
                <Save size={16} />
                Saved successfully
              </span>
            )}
            <Button variant="primary" icon={Save} onClick={handleSave}>
              Save Settings
            </Button>
          </div>

          <div className="mt-6 p-4 bg-[#1a73e8]/5 border border-[#1a73e8]/20 rounded-lg">
            <p className="text-xs text-slate-400">
              This information will be included in exported evaluation reports. 
              All data is stored locally in your browser.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
