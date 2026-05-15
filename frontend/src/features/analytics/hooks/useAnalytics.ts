import { getAnalyticsApi } from '#/features/polls/api/pollsApi'
import React, { useEffect } from 'react'

export function useAnalytics(pollId: string) {
  const [analytics, setAnalytics] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  const fetch = async () => {
    try {
      const { data } = await getAnalyticsApi(pollId)
      setAnalytics(data)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch()
  }, [pollId])

  return { analytics, loading, refetch: fetch }
}
