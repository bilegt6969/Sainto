// components/ProgressBar.tsx
'use client'

import NextNProgress from 'nextjs-progressbar'

export default function ProgressBar() {
  return <NextNProgress color="#000000" height={2} options={{ showSpinner: false }} />
}
