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
        <meta name="theme-color" content="#0a0f1c" />
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
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@300;400;500;600;700&display=swap');

        :root {
          --bg-primary: #0a0f1c;
          --bg-secondary: #111827;
          --bg-card: #1a2234;
          --bg-card-hover: #1f2a40;
          --accent-primary: #3b82f6;
          --accent-secondary: #8b5cf6;
          --accent-success: #10b981;
          --accent-warning: #f59e0b;
          --accent-error: #ef4444;
          --text-primary: #f8fafc;
          --text-secondary: #94a3b8;
          --text-muted: #64748b;
          --border-color: #2d3a4f;
          --gradient-primary: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          --gradient-success: linear-gradient(135deg, #10b981 0%, #059669 100%);
          --shadow-glow: 0 0 40px rgba(59, 130, 246, 0.15);
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
          line-height: 1.6;
          color: var(--text-primary);
          background: var(--bg-primary);
          min-height: 100vh;
        }

        ::selection {
          background: var(--accent-primary);
          color: white;
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 24px;
        }

        h1, h2, h3, h4, h5, h6 {
          font-weight: 600;
          letter-spacing: -0.02em;
        }

        code, .mono {
          font-family: 'JetBrains Mono', monospace;
        }

        button {
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        input, textarea {
          font-family: inherit;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease forwards;
        }

        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}
