'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  PlayCircle,
  BarChart3,
  Settings,
  FileText,
  ChevronRight,
  Globe,
  ChevronDown,
  Menu,
  X,
  Database,
  Cloud,
  Shield,
  Activity,
} from 'lucide-react';
import { trackNavigation } from '../lib/analytics';

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
};

type LayoutProps = {
  children: React.ReactNode;
  activeNav?: string;
  onNavChange?: (id: string) => void;
  breadcrumbs?: string[];
  user?: { role: string; email: string } | null;
};

export function Layout({ children, activeNav = 'dashboard', onNavChange, breadcrumbs = ['Dashboard'], user }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('ap-south-1');

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'evaluate', label: 'New Evaluation', icon: <PlayCircle size={18} /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 size={18} /> },
    { id: 'resources', label: 'Resources', icon: <Database size={18} /> },
  ];

  const regions = [
    { code: 'ap-south-1', name: 'Asia Pacific (Mumbai)' },
    { code: 'us-east-1', name: 'US East (N. Virginia)' },
    { code: 'eu-west-1', name: 'Europe (Ireland)' },
  ];

  const handleNavClick = (id: string) => {
    trackNavigation(id);
    onNavChange?.(id);
  };

  useEffect(() => {
    const handleClickOutside = () => setRegionOpen(false);
    if (regionOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [regionOpen]);

  return (
    <div className="layout">
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-mark">
              <Cloud size={20} />
            </div>
            {!sidebarCollapsed && (
              <div className="logo-text">
                <span className="logo-title">Mentora</span>
                <span className="logo-subtitle">Teaching Intelligence</span>
              </div>
            )}
          </div>
          <button 
            className="collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? <Menu size={16} /> : <X size={16} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            {!sidebarCollapsed && <span className="nav-section-label">Main</span>}
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className="nav-icon">{item.icon}</span>
                {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
                {!sidebarCollapsed && activeNav === item.id && (
                  <span className="nav-indicator" />
                )}
              </button>
            ))}
          </div>

          <div className="nav-section">
            {!sidebarCollapsed && <span className="nav-section-label">System</span>}
            <button 
              className="nav-item"
              onClick={() => handleNavClick('settings')}
              title={sidebarCollapsed ? 'Settings' : undefined}
            >
              <span className="nav-icon"><Settings size={18} /></span>
              {!sidebarCollapsed && <span className="nav-label">Settings</span>}
            </button>
            <button 
              className="nav-item"
              onClick={() => window.open('/docs', '_blank')}
              title={sidebarCollapsed ? 'API Docs' : undefined}
            >
              <span className="nav-icon"><FileText size={18} /></span>
              {!sidebarCollapsed && <span className="nav-label">API Docs</span>}
            </button>
          </div>
        </nav>

        {!sidebarCollapsed && (
          <div className="sidebar-footer">
            <div className="system-status">
              <div className="status-row">
                <Shield size={12} />
                <span>Secure Connection</span>
                <span className="status-dot active" />
              </div>
              <div className="status-row">
                <Activity size={12} />
                <span>All Services</span>
                <span className="status-dot active" />
              </div>
            </div>
          </div>
        )}
      </aside>

      <div className="main-wrapper">
        <header className="topbar">
          <div className="topbar-left">
            <div className="breadcrumbs">
              <span className="breadcrumb-root">mentora-prod-{selectedRegion}</span>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  <ChevronRight size={14} className="breadcrumb-sep" />
                  <span className={idx === breadcrumbs.length - 1 ? 'breadcrumb-current' : 'breadcrumb-item'}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="topbar-right">
            <div className="region-selector" onClick={(e) => { e.stopPropagation(); setRegionOpen(!regionOpen); }}>
              <Globe size={14} />
              <span className="region-code">{selectedRegion}</span>
              <ChevronDown size={14} className={`region-chevron ${regionOpen ? 'open' : ''}`} />
              
              {regionOpen && (
                <div className="region-dropdown">
                  <div className="region-dropdown-header">Select Region</div>
                  {regions.map((region) => (
                    <button
                      key={region.code}
                      className={`region-option ${selectedRegion === region.code ? 'selected' : ''}`}
                      onClick={() => { setSelectedRegion(region.code); setRegionOpen(false); }}
                    >
                      <span className="region-option-code">{region.code}</span>
                      <span className="region-option-name">{region.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user && (
              <div className="user-info">
                <div className="user-role">{user.role}</div>
                <span className="user-email">{user.email}</span>
              </div>
            )}
          </div>
        </header>

        <main className="main-content">
          {children}
        </main>
      </div>

      <style jsx>{`
        .layout {
          display: flex;
          min-height: 100vh;
          background: #0a0d12;
        }

        .sidebar {
          width: 260px;
          background: #0f1318;
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          transition: width 0.2s ease;
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          z-index: 100;
        }

        .sidebar.collapsed {
          width: 64px;
        }

        .sidebar-header {
          padding: 20px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 72px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          overflow: hidden;
        }

        .logo-mark {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
          white-space: nowrap;
        }

        .logo-title {
          font-size: 16px;
          font-weight: 600;
          color: #f1f5f9;
          letter-spacing: -0.02em;
        }

        .logo-subtitle {
          font-size: 11px;
          color: #64748b;
          letter-spacing: 0.02em;
        }

        .collapse-btn {
          width: 28px;
          height: 28px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
        }

        .collapse-btn:hover {
          background: rgba(255,255,255,0.08);
          color: #f1f5f9;
        }

        .sidebar-nav {
          flex: 1;
          padding: 16px 12px;
          overflow-y: auto;
        }

        .nav-section {
          margin-bottom: 24px;
        }

        .nav-section-label {
          display: block;
          font-size: 10px;
          font-weight: 600;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 0 12px;
          margin-bottom: 8px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 12px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: #94a3b8;
          font-size: 13px;
          font-weight: 450;
          cursor: pointer;
          transition: all 0.15s;
          position: relative;
          text-align: left;
        }

        .sidebar.collapsed .nav-item {
          justify-content: center;
          padding: 10px;
        }

        .nav-item:hover {
          background: rgba(255,255,255,0.04);
          color: #f1f5f9;
        }

        .nav-item.active {
          background: rgba(14, 165, 233, 0.1);
          color: #0ea5e9;
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .nav-label {
          white-space: nowrap;
        }

        .nav-indicator {
          position: absolute;
          right: 8px;
          width: 4px;
          height: 4px;
          background: #0ea5e9;
          border-radius: 50%;
        }

        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .system-status {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .status-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: #64748b;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #475569;
          margin-left: auto;
        }

        .status-dot.active {
          background: #10b981;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
        }

        .main-wrapper {
          flex: 1;
          margin-left: 260px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          transition: margin-left 0.2s ease;
        }

        .sidebar.collapsed ~ .main-wrapper {
          margin-left: 64px;
        }

        .topbar {
          height: 56px;
          background: #0f1318;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .topbar-left {
          display: flex;
          align-items: center;
        }

        .breadcrumbs {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
        }

        .breadcrumb-root {
          color: #64748b;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
        }

        .breadcrumb-sep {
          color: #334155;
        }

        .breadcrumb-item {
          color: #64748b;
        }

        .breadcrumb-current {
          color: #f1f5f9;
          font-weight: 500;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .region-selector {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          color: #94a3b8;
          font-size: 12px;
          cursor: pointer;
          position: relative;
          transition: all 0.15s;
        }

        .region-selector:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.12);
        }

        .region-code {
          font-family: 'JetBrains Mono', monospace;
        }

        .region-chevron {
          transition: transform 0.2s;
        }

        .region-chevron.open {
          transform: rotate(180deg);
        }

        .region-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 220px;
          background: #1a1f28;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }

        .region-dropdown-header {
          padding: 10px 14px;
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .region-option {
          display: flex;
          flex-direction: column;
          gap: 2px;
          width: 100%;
          padding: 10px 14px;
          background: transparent;
          border: none;
          text-align: left;
          cursor: pointer;
          transition: background 0.15s;
        }

        .region-option:hover {
          background: rgba(255,255,255,0.04);
        }

        .region-option.selected {
          background: rgba(14, 165, 233, 0.1);
        }

        .region-option-code {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: #f1f5f9;
        }

        .region-option-name {
          font-size: 11px;
          color: #64748b;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 12px;
          background: rgba(255,255,255,0.04);
          border-radius: 6px;
        }

        .user-role {
          padding: 3px 8px;
          background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .user-email {
          font-size: 12px;
          color: #94a3b8;
        }

        .main-content {
          flex: 1;
          padding: 32px;
        }

        @media (max-width: 1024px) {
          .sidebar {
            width: 64px;
          }

          .sidebar .logo-text,
          .sidebar .nav-label,
          .sidebar .nav-section-label,
          .sidebar .nav-indicator,
          .sidebar .sidebar-footer {
            display: none;
          }

          .sidebar .nav-item {
            justify-content: center;
            padding: 10px;
          }

          .main-wrapper {
            margin-left: 64px;
          }
        }
      `}</style>
    </div>
  );
}
