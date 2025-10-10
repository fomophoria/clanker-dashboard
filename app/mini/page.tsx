'use client'
import { useEffect } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

export default function MiniApp() {
    useEffect(() => {
        sdk.actions.ready().catch(() => { })
    }, [])

    return (
        <>
            {/* Disable body scroll */}
            <style jsx global>{`
        html, body, #__next {
          height: 100%;
          overflow: hidden;
          background: #000;
        }
      `}</style>

            <div
                className="mx-auto bg-black overflow-hidden"
                style={{
                    width: '100%',
                    maxWidth: 424,
                    height: '100dvh',
                }}
            >
                <iframe
                    src="/launch"
                    title="DEADLOOP"
                    style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        display: 'block',
                        overflow: 'hidden',
                    }}
                    scrolling="no"  // <── disable inner scroll
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
            </div>
        </>
    )
}
