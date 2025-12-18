import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
            'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
            'Helvetica Neue', sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        h1, h2, h3, h4, h5, h6 {
          margin-bottom: 10px;
        }

        button {
          font-family: inherit;
        }

        input, textarea {
          font-family: inherit;
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}