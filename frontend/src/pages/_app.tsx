import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { GA_MEASUREMENT_ID, pageview } from '../lib/analytics';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      pageview(url);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0d12" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      
      {GA_MEASUREMENT_ID && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

        :root {
          --bg-base: #0a0d12;
          --bg-surface: #0f1318;
          --bg-elevated: #151a22;
          --bg-overlay: #1a1f28;
          
          --border-subtle: rgba(255, 255, 255, 0.06);
          --border-default: rgba(255, 255, 255, 0.1);
          --border-strong: rgba(255, 255, 255, 0.15);
          
          --text-primary: #f1f5f9;
          --text-secondary: #94a3b8;
          --text-muted: #64748b;
          --text-faint: #475569;
          
          --accent-blue: #0ea5e9;
          --accent-indigo: #6366f1;
          --accent-emerald: #10b981;
          --accent-amber: #f59e0b;
          --accent-rose: #ef4444;
          --accent-violet: #8b5cf6;
          
          --gradient-primary: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
          --gradient-success: linear-gradient(135deg, #10b981 0%, #0ea5e9 100%);
          --gradient-subtle: linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%);
          
          --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
          --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
          --shadow-lg: 0 10px 40px rgba(0, 0, 0, 0.5);
          --shadow-glow-blue: 0 0 30px rgba(14, 165, 233, 0.2);
          
          --radius-sm: 6px;
          --radius-md: 8px;
          --radius-lg: 12px;
          --radius-xl: 16px;
          
          --spacing-xs: 4px;
          --spacing-sm: 8px;
          --spacing-md: 16px;
          --spacing-lg: 24px;
          --spacing-xl: 32px;
          --spacing-2xl: 48px;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html {
          font-size: 16px;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
          line-height: 1.5;
          color: var(--text-primary);
          background: var(--bg-base);
          min-height: 100vh;
        }

        ::selection {
          background: var(--accent-blue);
          color: white;
        }

        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: var(--border-default);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: var(--border-strong);
        }

        h1, h2, h3, h4, h5, h6 {
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1.3;
        }

        h1 { font-size: 28px; }
        h2 { font-size: 22px; }
        h3 { font-size: 16px; }
        h4 { font-size: 14px; }

        code, .mono {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
        }

        button {
          font-family: inherit;
          cursor: pointer;
          border: none;
          background: transparent;
          transition: all 0.15s ease;
        }

        button:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        input, textarea, select {
          font-family: inherit;
          font-size: inherit;
        }

        a {
          color: var(--accent-blue);
          text-decoration: none;
          transition: color 0.15s ease;
        }

        a:hover {
          color: var(--text-primary);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease forwards;
        }

        .animate-slide-in {
          animation: slideIn 0.3s ease forwards;
        }

        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          *, ::before, ::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        @media print {
          body {
            background: white;
            color: black;
          }
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}
