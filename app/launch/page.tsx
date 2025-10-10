// app/launch/page.tsx
import type { Metadata } from 'next'
import LaunchClient from './LaunchClient'

const title = 'DEADLOOP PROTOCOL — Launching Soon on Clanker'
const description = 'Transparent, automated token burns on Base, tracked in real time.'

export const metadata: Metadata = {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
}

export default function LaunchPage() {
    return <LaunchClient />
}
