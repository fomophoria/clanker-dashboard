// app/mini/head.tsx
export default function Head() {
    const mini = {
        version: '1',
        imageUrl: 'https://deadloop.xyz/og-1200x800.png', // 3:2 image for the card
        button: {
            title: 'Open DEADLOOP',
            action: {
                type: 'launch_miniapp',
                url: 'https://deadloop.xyz/mini',
                name: 'DEADLOOP PROTOCOL',
                splashImageUrl: 'https://deadloop.xyz/icon-200.png',
                splashBackgroundColor: '#000000',
            },
        },
    };

    return (
        <>
            <meta name="fc:miniapp" content={JSON.stringify(mini)} />
            {/* Also set OG/Twitter for normal link shares */}
            <meta property="og:title" content="DEADLOOP PROTOCOL" />
            <meta property="og:description" content="Transparent, automated token burns on Base." />
            <meta property="og:image" content="https://deadloop.xyz/og-1200x800.png" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="DEADLOOP PROTOCOL" />
            <meta name="twitter:description" content="Transparent, automated token burns on Base." />
            <meta name="twitter:image" content="https://deadloop.xyz/og-1200x800.png" />
            <title>DEADLOOP Mini App</title>
        </>
    );
}
