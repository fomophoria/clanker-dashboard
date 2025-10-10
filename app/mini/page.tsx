'use client'
import { useEffect } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

export default function MiniApp() {
    useEffect(() => {
        sdk.actions.ready().catch(() => { })
    }, [])

    return (
        <>
            {/* prevent the OUTER page from scrolling anywhere */}
            <style jsx global>{`
        html, body, #__next {
          height: 100%;
          overflow: hidden;    /* <- kill the outer scrollbar */
          background: #000;
        }
      `}</style>

            <div
                className="mx-auto bg-black overflow-hidden"
                style={{
                    width: '100%',
                    maxWidth: 424,       // mini app width on web
                    height: '100dvh',    // fill host height on mobile/web
                    // IMPORTANT: no maxHeight here so the page itself never needs to scroll
                }}
            >
                <iframe
                    src="/launch"        // same-origin
                    title="DEADLOOP"
                    style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        display: 'block',
                        overflow: 'hidden',
                    }}
                    scrolling="auto"     // the ONLY scrollbar, inside the iframe
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
            </div>
        </>
    )
}
