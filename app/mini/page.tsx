'use client'
import { useEffect } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

export default function MiniApp() {
    useEffect(() => {
        sdk.actions.ready().catch(() => { })
    }, [])

    return (
        <>
            {/* Make the host page itself non-scrollable */}
            <style jsx global>{`
        html, body {
          height: 100%;
          overflow: hidden;      /* <- hide any outer scrollbar */
          background: #000;
        }
        #__next, main {
          height: 100%;
        }
      `}</style>

            {/* Fill the host window; center a 424px-wide column */}
            <div className="fixed inset-0 flex justify-center bg-black">
                <div
                    className="overflow-hidden"
                    style={{
                        width: '100%',
                        maxWidth: 424,        // Mini App width on web host
                        height: '100%',       // fill host height; no outer scrolling
                    }}
                >
                    <iframe
                        src="/launch"         // same-origin route
                        title="DEADLOOP"
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            display: 'block',
                            overflow: 'hidden',
                        }}
                        scrolling="auto"      // allow a single inner scrollbar only
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    />
                </div>
            </div>
        </>
    )
}
