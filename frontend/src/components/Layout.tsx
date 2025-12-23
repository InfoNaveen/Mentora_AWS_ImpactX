/**
 * Main Layout Component
 * AWS Console-style layout with sidebar
 */
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  LayoutDashboard, 
  BarChart2, 
  Settings, 
  Menu, 
  X, 
  ChevronRight,
  User,
  Bell,
  Search,
  HelpCircle,
  LogOut,
  Shield
} from 'lucide-react';
import { apiService } from '../lib/api';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title = 'Mentora' }) => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('mentora_token');
    if (token) {
      apiService.getMe(token).then(u => setUser(u)).catch(() => setUser(null));
    }
  }, []);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Evaluations', icon: BarChart2, path: '/evaluations' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('mentora_token');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#0f1111] flex flex-col text-[#eaeded]">
      <Head>
        <title>{title} | Mentora AI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Top Navbar - AWS Style */}
      <header className="h-12 bg-[#232f3e] flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#ff9900] rounded flex items-center justify-center font-black text-[#232f3e] text-lg">M</div>
            <span className="font-bold text-lg text-white">Mentora</span>
          </div>
          
          <div className="hidden md:flex items-center bg-[#16191f] border border-[#354141] rounded h-8 px-2 w-96">
            <Search size={16} className="text-[#95a5a6]" />
            <input 
              type="text" 
              placeholder="Search for evaluations, classes..." 
              className="bg-transparent border-none text-sm focus:outline-none px-2 w-full text-[#eaeded]"
            />
          </div>
        </div>

        <div className="flex items-center gap-5 h-full">
          <div className="hidden lg:flex items-center gap-2 text-xs font-medium px-3 h-full hover:bg-white/10 cursor-pointer">
            <span className="text-[#95a5a6]">Region:</span>
            <span>ap-south-1 (Mumbai)</span>
          </div>
          
          <div className="flex items-center gap-3 h-full px-2">
            <Bell size={18} className="text-[#eaeded] cursor-pointer hover:text-[#ff9900]" />
            <HelpCircle size={18} className="text-[#eaeded] cursor-pointer hover:text-[#ff9900]" />
            
            <div className="flex items-center gap-2 pl-2 border-l border-[#354141] h-6 ml-2">
              <div className="w-6 h-6 bg-[#1e2121] rounded-full flex items-center justify-center border border-[#354141]">
                <User size={14} className="text-[#ff9900]" />
              </div>
              <span className="text-sm font-medium truncate max-w-[100px]">{user?.username || 'Demo User'}</span>
              <button onClick={handleLogout} className="p-1 hover:bg-white/10 rounded">
                <LogOut size={14} className="text-[#95a5a6]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - AWS Style */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-12'} bg-[#16191f] border-r border-[#354141] flex flex-col transition-all duration-200`}>
          <div className="p-3 flex justify-end">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-[#354141] rounded text-[#95a5a6]"
            >
              {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
          
          <nav className="flex-1 px-2 space-y-0.5">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors group
                  ${router.pathname === item.path
                    ? 'bg-[#354141] text-[#ff9900]'
                    : 'text-[#95a5a6] hover:bg-[#354141] hover:text-[#eaeded]'}
                `}
              >
                <item.icon size={18} />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            ))}
          </nav>
          
          <div className="p-4 border-t border-[#354141]">
            <div className="bg-[#1e2121] p-3 rounded border border-[#354141]">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={14} className="text-[#ff9900]" />
                <span className="text-[10px] font-bold text-[#ff9900] uppercase">Trust Boundary Active</span>
              </div>
              <p className="text-[10px] text-[#95a5a6] leading-tight">
                All evaluations are verified by Agentic Mesh.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#0f1111]">
          {/* Breadcrumbs */}
          <div className="bg-[#1e2121] h-9 flex items-center px-6 border-b border-[#354141]">
            <nav className="flex items-center text-[11px] font-medium text-[#95a5a6]">
              <span className="hover:text-[#eaeded] cursor-pointer">Mentora AI</span>
              <ChevronRight size={14} />
              <span className="text-[#eaeded] font-bold">{title}</span>
            </nav>
          </div>
          
          <div className="p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&display=swap');
        
        body {
          margin: 0;
          font-family: 'Open Sans', sans-serif;
          background-color: #0f1111;
        }
        
        .aws-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: #eaeded;
        }
      `}</style>
    </div>
  );
};
