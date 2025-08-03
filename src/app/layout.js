import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'IAC Nashik - Solar Plant Certificate Portal',
  description: 'Official employee participation portal for IAC Nashik Solar Plant Inauguration 2025',
  keywords: 'IAC, Nashik, Solar Plant, Certificate, Renewable Energy, IAC Lumax',
  author: 'IAC Nashik Development Team',
  metadataBase: new URL('https://iac-nashik-certificate.vercel.app'),
  robots: 'index, follow',
  openGraph: {
    title: 'IAC Nashik - Solar Plant Certificate Portal',
    description: 'Official employee participation portal for IAC Nashik Solar Plant Inauguration 2025',
    type: 'website',
    locale: 'en_US',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: 'no',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#0d9488" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="IAC Nashik Certificate" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://iac-nashik-certificate.vercel.app" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
