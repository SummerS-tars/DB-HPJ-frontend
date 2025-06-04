import api from './api'

export const evaluationTagApi = {
  // Create evaluation tag
  createTag(data) {
    return api.post('/evaluation-tags', data)
  },

  // Get all evaluation tags
  getTags() {
    return api.get('/evaluation-tags')
  }
}

export const evaluationResultApi = {
  // Import evaluation results
  importResults(results) {
    return api.post('/evaluation-results/import', results)
  },

  // Get evaluation results list
  getResults(params = {}) {
    return api.get('/evaluation-results', { params })
  },

  // Export evaluation results
  exportResults(params = {}) {
    return api.get('/evaluation-results/export', { 
      params,
      responseType: 'blob'
    })
  }
}

export const analysisTagApi = {
  // Create analysis tag
  createTag(data) {
    return api.post('/analysis-tags', data)
  },

  // Get all analysis tags
  getTags() {
    return api.get('/analysis-tags')
  }
}

export const evaluationAnalysisApi = {
  // Import evaluation analysis
  importAnalysis(analysis) {
    return api.post('/evaluation-analysis/import', analysis)
  },

  // Get evaluation analysis results
  getAnalysis(params = {}) {
    return api.get('/evaluation-analysis', { params })
  }
} 