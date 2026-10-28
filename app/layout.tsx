import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import Providers from '@/components/Providers'
import SiteChrome from '@/components/site/SiteChrome'
import PwaClient from '@/components/site/PwaClient'
import { GA_ID, SITE } from '@/lib/config'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const cormorant = Cormorant_Garamond({ subsets: ['latin'], variable: '--font-cormorant', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: 'LICHT SIGNATURE SOUVENIRS | Memorable Moments, Beautifully Preserved', template: '%s | LICHT SIGNATURE SOUVENIRS' },
  description: SITE.description,
  applicationName: 'LICHT SIGNATURE',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'LICHT', statusBarStyle: 'black-translucent' },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website', siteName: SITE.name, title: SITE.name, description: SITE.description,
    images: [{ url: '/images/products/led-vanity-mirror.jpg', width: 516, height: 594, alt: 'Backlit LED vanity mirror' }],
  },
  twitter: { card: 'summary_large_image', title: SITE.name, description: SITE.description },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#28231f',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB">
      <body className={`${inter.variable} ${cormorant.variable} antialiased`}>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-ink focus:px-4 focus:py-3 focus:text-xs focus:text-white">Skip to content</a>
        <Providers>
          <SiteChrome>{children}</SiteChrome>
          <PwaClient />
        </Providers>
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}');`}</Script>
          </>
        )}
        {/* Vercel Analytics only exists on Vercel; on Cloudflare use GA (NEXT_PUBLIC_GA_ID) or Cloudflare Web Analytics */}
        {process.env.VERCEL && <Analytics />}
      </body>
    </html>
  )
}
