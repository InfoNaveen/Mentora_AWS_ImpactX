/**
 * Main Layout Component
 * AWS Console-style layout with sidebar
 */
import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, BarChart2, Settings, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title = 'Mentora' }) => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Evaluations', icon: BarChart2, path: '/evaluations' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0d12] flex flex-col text-[#f1f5f9]">
      <Head>
        <title>{title} | Mentora AI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Top Navbar */}
      <header className="h-14 bg-[#151a22] border-b border-[#2d3748] flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-white/5 rounded text-[#94a3b8]"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1a73e8] rounded flex items-center justify-center font-bold text-white text-sm">M</div>
            <span className="font-semibold text-lg tracking-tight">Mentora</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500 font-mono">ap-south-1</span>
          <div className="w-8 h-8 bg-[#64748b] rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-medium">DU</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 bg-[#151a22] border-r border-[#2d3748] flex flex-col">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors
                    ${router.pathname === item.path
                      ? 'bg-[#1a73e8]/10 text-[#1a73e8] border-l-2 border-[#1a73e8]'
                      : 'text-[#94a3b8] hover:bg-white/5 hover:text-[#f1f5f9]'}
                  `}
                >
                  <item.icon size={18} />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#0a0d12]">
          <div className="p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <style jsx global>{`
        body {
          margin: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background-color: #0a0d12;
        }
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0a0d12;
        }
        ::-webkit-scrollbar-thumb {
          background: #2d3748;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #4a5568;
        }
      `}</style>
    </div>
  );
};

