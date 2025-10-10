'use client'
import { useEffect } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

export default function MiniApp() {
    useEffect(() => {
        // Tell Farcaster host we're ready when the component mounts
        sdk.actions.ready().catch(() => { })
    }, [])

    return (
        <div
            className="mx-auto bg-black overflow-hidden"
            style={{
                width: '100%',
                maxWidth: 424,
                height: '100dvh',
                maxHeight: 695,
                overflow: 'hidden',
            }}
        >
            <iframe
                src="/launch"
                title="DEADLOOP"
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    overflow: 'hidden',
                    display: 'block',
                }}
                scrolling="no"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
        </div>
    )
}
