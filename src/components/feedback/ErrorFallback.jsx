import { useEffect } from 'react';
import { logger } from '../../lib/logger';

export default function ErrorFallback({ error, resetErrorBoundary }) {
  useEffect(() => {
    if (error) {
      logger.captureException(error);
    }
  }, [error]);
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: '#FAF6F2',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        textAlign: 'center',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          margin: '0 auto 20px',
          background: '#F5EDE6',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
        }}>
          ⚠️
        </div>

        <h1 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: '#3D405B',
          margin: '0 0 8px',
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}>
          Something went wrong
        </h1>

        <p style={{
          fontSize: '14px',
          color: '#94A3B8',
          lineHeight: 1.5,
          margin: '0 0 6px',
        }}>
          An unexpected error occurred. Please try again.
        </p>

        {error?.message && (
          <details style={{ marginTop: '12px', cursor: 'pointer' }}>
            <summary style={{
              fontSize: '12px',
              color: '#94A3B8',
              fontWeight: 600,
              textAlign: 'left',
            }}>
              Error details
            </summary>
            <pre style={{
              marginTop: '8px',
              padding: '12px',
              background: '#F5EDE6',
              borderRadius: '8px',
              fontSize: '11px',
              color: '#8B4513',
              textAlign: 'left',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            }}>
              {error.message}
            </pre>
          </details>
        )}

        <button
          onClick={resetErrorBoundary}
          style={{
            marginTop: '24px',
            padding: '10px 32px',
            background: '#C67B5C',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#A55E3A'}
          onMouseOut={(e) => e.currentTarget.style.background = '#C67B5C'}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
