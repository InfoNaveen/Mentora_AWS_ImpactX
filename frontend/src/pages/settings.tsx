import React from 'react';
import { Layout } from '../components/Layout';
import { Settings as SettingsIcon, Shield, CreditCard, Bell, Key, Database, Globe } from 'lucide-react';
import { Button } from '../components/Button';

export default function Settings() {
  const settingsSections = [
    { name: 'General', icon: SettingsIcon, description: 'Application naming, region and base infrastructure' },
    { name: 'Identity & Access', icon: Key, description: 'IAM policies, user roles and API keys' },
    { name: 'Evaluation Rubric', icon: Shield, description: 'Configure AI analysis parameters and scoring weights' },
    { name: 'Regions', icon: Globe, description: 'Manage AWS regions and data residency' },
    { name: 'Notifications', icon: Bell, description: 'Slack, Email and Cloudwatch alerts' },
    { name: 'Storage', icon: Database, description: 'S3 bucket lifecycle and retention policies' },
  ];

  return (
    <Layout title="Settings">
      <div className="max-w-4xl space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Management Console</h1>
          <p className="text-slate-400">Configure your Mentora AI environment and pedagogical parameters.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {settingsSections.map((section) => (
            <div key={section.name} className="p-6 bg-[#151a22] border border-[#2d3748] rounded-xl hover:border-[#1a73e8]/50 transition-colors cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#2d3748]/50 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-[#1a73e8] transition-colors">
                  <section.icon size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-white group-hover:text-[#1a73e8] transition-colors">{section.name}</h4>
                  <p className="text-sm text-slate-500 mt-1">{section.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-[#2d3748]">
          <div className="bg-[#1a73e8]/5 border border-[#1a73e8]/20 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
              <Shield size={18} className="text-[#1a73e8]" />
              Enterprise Security
            </h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              All evaluations are encrypted at rest using AWS KMS (Key Management Service). 
              Your data never leaves the ap-south-1 region during analysis.
            </p>
            <div className="flex gap-3">
              <Button size="sm">Manage Encryption Keys</Button>
              <Button size="sm" variant="secondary">Security Audit Log</Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
