import api from './api'

export const evaluationTagApi = {
  // Create evaluation tag
  createTag(data) {
    return api.post('/evaluation-tags', data)
  },

  // Get evaluation tags list
  getTags(params = {}) {
    return api.get('/evaluation-tags', { params })
  },

  // Get single evaluation tag
  getTag(tagId) {
    return api.get(`/evaluation-tags/${tagId}`)
  },

  // Update evaluation tag
  updateTag(tagId, data) {
    return api.put(`/evaluation-tags/${tagId}`, data)
  },

  // Delete evaluation tag
  deleteTag(tagId) {
    return api.delete(`/evaluation-tags/${tagId}`)
  }
}

export const evaluationResultApi = {
  // Import evaluation results
  importResults(file, evaluationTagId, type) {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/evaluation-results/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      params: { evaluationTagId, type }
    })
  },

  // Get evaluation results list
  getResults(params = {}) {
    return api.get('/evaluation-results', { params })
  },

  // Get single evaluation result
  getResult(id) {
    return api.get(`/evaluation-results/${id}`)
  },

  // Update evaluation result status
  updateStatus(id, status) {
    return api.patch(`/evaluation-results/${id}/status`, { status })
  },

  // Export evaluation results
  exportResults(params = {}) {
    return api.get('/evaluation-results/export', { 
      params,
      responseType: 'blob'
    })
  },

  // Get evaluation results for a standard question
  getResultsForQuestion(stdQuestionId, params = {}) {
    return api.get(`/std-questions/${stdQuestionId}/evaluation-results`, { params })
  }
}

export const analysisTagApi = {
  // Create analysis tag
  createTag(data) {
    return api.post('/analysis-tags', data)
  },

  // Get analysis tags list
  getTags(params = {}) {
    return api.get('/analysis-tags', { params })
  },

  // Get single analysis tag
  getTag(analysisTagId) {
    return api.get(`/analysis-tags/${analysisTagId}`)
  },

  // Update analysis tag
  updateTag(analysisTagId, data) {
    return api.put(`/analysis-tags/${analysisTagId}`, data)
  },

  // Delete analysis tag
  deleteTag(analysisTagId) {
    return api.delete(`/analysis-tags/${analysisTagId}`)
  }
}

export const evaluationAnalysisApi = {
  // Import evaluation analysis
  importAnalysis(file, analysisTagId) {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/evaluation-analysis/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      params: { analysisTagId }
    })
  },

  // Get evaluation analysis list
  getAnalysis(params = {}) {
    return api.get('/evaluation-analysis', { params })
  },

  // Get single evaluation analysis
  getAnalysisResult(id) {
    return api.get(`/evaluation-analysis/${id}`)
  },

  // Update evaluation analysis
  updateAnalysis(id, data) {
    return api.put(`/evaluation-analysis/${id}`, data)
  }
} 