'use client'

import { useEffect, useState } from 'react'

export const DebugEnv = () => {
  const [envVars, setEnvVars] = useState<any>({})

  useEffect(() => {
    // Check environment variables
    const vars = {
      NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NODE_ENV: process.env.NODE_ENV,
    }
    setEnvVars(vars)
    console.log('Environment Variables:', vars)
  }, [])

  if (process.env.NODE_ENV === 'production') {
    return null // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Debug Environment Variables:</h3>
      <pre className="whitespace-pre-wrap">
        {JSON.stringify(envVars, null, 2)}
      </pre>
    </div>
  )
} 