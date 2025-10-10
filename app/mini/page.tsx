'use client'
import { useEffect } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

export default function MiniApp() {
    useEffect(() => {
        sdk.actions.ready().catch(() => { })
    }, [])

    return (
        <div
            className="mx-auto bg-black"
            style={{
                width: '100%',
                maxWidth: 424,
                height: '100dvh',   // better on mobile than 100vh
                maxHeight: 695,
            }}
        >
            <iframe
                src="/launch"  // <-- SAME ORIGIN path
                title="DEADLOOP"
                style={{ width: '100%', height: '100%', border: 0 }}
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
        </div>
    )
}
