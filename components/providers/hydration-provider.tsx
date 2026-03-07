"use client"

import { useEffect, useState } from 'react'

interface HydrationProviderProps {
  children: React.ReactNode
}

export function HydrationProvider({ children }: HydrationProviderProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return null
  }

  return <>{children}</>
}

// Hook to check if component has mounted (client-side)
export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  return hasMounted
}
