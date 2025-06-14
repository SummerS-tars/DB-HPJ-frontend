import api from './api'

export const statisticsApi = {
  // Get overall system statistics
  getOverallStatistics() {
    return api.get('/statistics/overall')
  },

  // Get statistics with caching support
  getOverallStatisticsWithCache() {
    const cacheKey = 'statistics_overall'
    const cacheTime = 5 * 60 * 1000 // 5 minutes
    
    // Check if we have cached data
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < cacheTime) {
        return Promise.resolve({ data: { success: true, data } })
      }
    }

    // Fetch fresh data
    return api.get('/statistics/overall').then(response => {
      // Cache the response
      if (response.data.success) {
        localStorage.setItem(cacheKey, JSON.stringify({
          data: response.data.data,
          timestamp: Date.now()
        }))
      }
      return response
    })
  },

  // Clear statistics cache
  clearCache() {
    localStorage.removeItem('statistics_overall')
  }
} 