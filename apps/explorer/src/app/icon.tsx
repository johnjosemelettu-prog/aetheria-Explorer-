import { ImageResponse } from 'next/og'

/**
 * @fileOverview High-Fidelity Aetheria Logo Icon Node.
 * Dynamically synthesizes the brand identity for favicons and browser tabs.
 * This route serves a PNG image at /icon.
 */

//export const runtime = 'edge'
export const dynamic = 'force-static' // Add this line

export const size = {
  width: 512,
  height: 512,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#020617', // Slate 950
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '24%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Deep Field Glow */}
        <div style={{
          position: 'absolute',
          width: '150%',
          height: '150%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        
        {/* Core Odyssey Node (SVG Backpack) */}
        <svg
          width="280"
          height="280"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ position: 'relative', zIndex: 10 }}
        >
          <path d="M4 7V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3" />
          <path d="M4 7h16" />
          <path d="M4 7v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7" />
          <path d="M9 20v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
          <path d="M11 7V5h2v2" />
        </svg>

        {/* Intelligence Spark Node */}
        <div style={{
          position: 'absolute',
          top: '12%',
          right: '12%',
          width: '28%',
          height: '28%',
          background: '#6366f1',
          borderRadius: '30%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '12px solid #020617',
          zIndex: 20,
        }}>
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="white"
          >
            <path d="M13 2 L3 14 h9 l-1 8 L21 10 h-9 z" />
          </svg>
        </div>

        <div style={{
          position: 'absolute',
          bottom: '10%',
          display: 'flex',
          color: 'white',
          fontSize: '48px',
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontFamily: 'sans-serif',
          zIndex: 30
        }}>
          AETHERIA
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}