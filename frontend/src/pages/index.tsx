/**
 * Home Page - Login/Demo Access
 */
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from '../components/Button';
import { Zap, Shield, BarChart3 } from 'lucide-react';
import { apiService } from '../lib/api';
import { analytics } from '../lib/analytics';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect if already authenticated
    if (apiService.isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleDemoAccess = async () => {
    try {
      await apiService.getDemoToken();
      analytics.loginDemo();
      router.push('/dashboard');
    } catch (error) {
      console.error('Demo access failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d12] flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-[#1a73e8] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-3xl font-bold">M</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Mentora AI</h1>
          <p className="text-xl text-slate-400 mb-2">
            AWS-First Multimodal AI for Teaching Quality Evaluation
          </p>
          <p className="text-sm text-slate-500">
            Powered by Amazon Bedrock • Transcribe • Rekognition
          </p>
        </div>

        <div className="bg-[#151a22] border border-[#2d3748] rounded-xl p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white mb-2">Quick Demo Access</h2>
            <p className="text-slate-400 mb-8">
              Get instant access to evaluate teaching quality with AI-powered analysis
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            icon={Zap}
            onClick={handleDemoAccess}
            className="mb-4"
          >
            Start Demo Evaluation
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-[#2d3748]">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#1a73e8]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="text-[#1a73e8]" size={24} />
              </div>
              <h3 className="text-sm font-medium text-white mb-1">AI Evaluation</h3>
              <p className="text-xs text-slate-500">Deterministic scoring</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#1a73e8]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="text-[#1a73e8]" size={24} />
              </div>
              <h3 className="text-sm font-medium text-white mb-1">Secure & Private</h3>
              <p className="text-xs text-slate-500">AWS-grade security</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#1a73e8]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="text-[#1a73e8]" size={24} />
              </div>
              <h3 className="text-sm font-medium text-white mb-1">Fast Analysis</h3>
              <p className="text-xs text-slate-500">Real-time results</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-slate-500">
          <p>Demo mode • No AWS credentials required</p>
        </div>
      </div>
    </div>
  );
}

