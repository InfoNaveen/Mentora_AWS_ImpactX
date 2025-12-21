import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  BarChart2, 
  LayoutDashboard, 
  Settings, 
  HelpCircle, 
  Bell, 
  User, 
  Search,
  ChevronDown,
  Globe,
  Menu,
  X,
  Plus
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const Layout = ({ children, title = 'Mentora' }: LayoutProps) => {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Evaluations', icon: BarChart2, path: '/evaluations' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0d12] flex flex-col text-[#f1f5f9]">
      <Head>
        <title>{title} | Mentora AI</title>
      </Head>

      {/* Top Navbar */}
      <header className="h-14 bg-[#151a22] border-b border-[#2d3748] flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 hover:bg-white/5 rounded text-[#94a3b8]"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1a73e8] rounded flex items-center justify-center font-bold text-white text-sm">M</div>
            <span className="font-semibold text-lg tracking-tight">Mentora</span>
          </div>
          
          <div className="ml-8 flex items-center bg-[#0a0d12] border border-[#2d3748] rounded px-3 py-1 gap-2 w-80">
            <Search size={16} className="text-[#64748b]" />
            <input 
              type="text" 
              placeholder="Search services, resources, docs" 
              className="bg-transparent border-none outline-none text-sm w-full py-0.5 text-[#f1f5f9]"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded transition-colors cursor-pointer">
            <Globe size={16} className="text-[#94a3b8]" />
            <span className="text-xs font-medium">ap-south-1</span>
            <ChevronDown size={14} className="text-[#94a3b8]" />
          </div>
          
          <div className="flex items-center gap-3 border-l border-[#2d3748] pl-4">
            <button className="p-1.5 hover:bg-white/5 rounded text-[#94a3b8] relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ef4444] rounded-full border border-[#151a22]"></span>
            </button>
            <button className="p-1.5 hover:bg-white/5 rounded text-[#94a3b8]">
              <HelpCircle size={18} />
            </button>
            <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded transition-colors cursor-pointer">
              <div className="w-6 h-6 bg-[#64748b] rounded-full flex items-center justify-center">
                <User size={14} className="text-white" />
              </div>
              <span className="text-sm font-medium">Patil @ mentora-prod</span>
              <ChevronDown size={14} className="text-[#94a3b8]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${isSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-200 bg-[#151a22] border-r border-[#2d3748] flex flex-col overflow-hidden`}>
          <div className="p-4">
            <button className="w-full bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded py-2 px-4 text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20">
              <Plus size={16} />
              <span>New Evaluation</span>
            </button>
          </div>
          
          <nav className="flex-1 px-2 py-2 space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Main</div>
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors
                  ${router.pathname === item.path 
                    ? 'bg-[#1a73e8]/10 text-[#1a73e8] border-l-2 border-[#1a73e8] rounded-l-none' 
                    : 'text-[#94a3b8] hover:bg-white/5 hover:text-[#f1f5f9]'}
                `}
              >
                <item.icon size={18} />
                <span>{item.name}</span>
              </Link>
            ))}
            
            <div className="pt-4 px-3 py-2 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Resources</div>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium text-[#94a3b8] hover:bg-white/5 hover:text-[#f1f5f9]">
              <BarChart2 size={18} />
              <span>Analytics</span>
            </a>
          </nav>

          <div className="p-4 border-t border-[#2d3748]">
            <div className="bg-[#0a0d12] rounded p-3 text-[11px] border border-[#2d3748]">
              <div className="text-[#64748b] mb-1">Current Active Session</div>
              <div className="text-[#f1f5f9] font-mono">mentora-prod-ap-south-1</div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full"></span>
                <span className="text-[#10b981]">Healthy</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative bg-[#0a0d12]">
          {/* Breadcrumbs */}
          <div className="h-10 bg-[#151a22] border-b border-[#2d3748] flex items-center px-6 text-xs gap-2">
            <span className="text-[#64748b]">mentora-prod-ap-south-1</span>
            <span className="text-[#475569]">/</span>
            <span className="text-[#f1f5f9]">Dashboard</span>
          </div>

          <div className="p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <style jsx global>{`
        body {
          margin: 0;
          font-family: 'Inter', sans-serif;
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
