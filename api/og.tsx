import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default function handler() {
  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a0a',
        backgroundImage: 'linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%)',
      }}
    >
      {/* Shield icon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 120,
          height: 120,
          borderRadius: 32,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          marginBottom: 40,
        }}
      >
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      </div>

      {/* Title */}
      <div
        style={{
          display: 'flex',
          fontSize: 64,
          fontWeight: 800,
          color: 'white',
          textAlign: 'center',
          marginBottom: 20,
        }}
      >
        Safe Unfollow
      </div>

      {/* Subtitle */}
      <div
        style={{
          display: 'flex',
          fontSize: 32,
          color: '#a1a1aa',
          textAlign: 'center',
          maxWidth: 800,
        }}
      >
        Check who unfollowed you on Instagram — 100% private, no login required
      </div>

      {/* Trust badges */}
      <div
        style={{
          display: 'flex',
          gap: 40,
          marginTop: 50,
          fontSize: 24,
          color: '#71717a',
        }}
      >
        <span>✓ Free Forever</span>
        <span>✓ No Password</span>
        <span>✓ 100% Local</span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  );
}
