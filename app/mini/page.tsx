'use client'
import { useEffect } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

export default function MiniApp() {
    useEffect(() => {
        sdk.actions.ready().catch(() => { })
    }, [])

    return (
        <div
            className="mx-auto bg-black overflow-hidden"
            style={{
                width: '100%',
                maxWidth: 424,      // mini app width on web
                height: '100dvh',   // fill the available host height
                maxHeight: 695,     // web host cap
            }}
        >
            <iframe
                src="/launch"       // same-origin page
                title="DEADLOOP"
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block',
                    overflow: 'hidden',
                }}
                scrolling="auto"    // single inner scrollbar if needed
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
        </div>
    )
}
