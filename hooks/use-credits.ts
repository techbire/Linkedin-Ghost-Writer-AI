"use client"

import { useState, useEffect } from "react"

export function useCredits() {
  const [credits, setCredits] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCredits = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/credits")
      if (response.ok) {
        const data = await response.json()
        setCredits(data.credits || 0)
        setError(null)
      } else {
        setError("Failed to fetch credits")
      }
    } catch (err) {
      setError("Error fetching credits")
      console.error("Error fetching credits:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCredits()
  }, [])

  const refreshCredits = () => {
    fetchCredits()
  }

  return {
    credits,
    loading,
    error,
    refreshCredits,
  }
}
