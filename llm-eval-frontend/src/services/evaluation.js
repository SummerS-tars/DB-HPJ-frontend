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

  // Get analysis tags list (paginated)
  getTags(params = {}) {
    return api.get('/analysis-tags', { params })
  },

  // Get single analysis tag
  getTag(analysisTagId) {
    return api.get(`/analysis-tags/${analysisTagId}`)
  },

  // Get analysis tags by evaluation tag ID
  getTagsByEvaluationTag(evaluationTagId) {
    return api.get(`/analysis-tags/by-evaluation-tag/${evaluationTagId}`)
  },

  // Get analysis tags by model
  getTagsByModel(model) {
    return api.get('/analysis-tags/by-model', { params: { model } })
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
  // Import evaluation analysis results (batch)
  importAnalysis(data) {
    return api.post('/evaluation-analysis/import', data)
  },

  // Get evaluation analysis list (paginated)
  getAnalysis(params = {}) {
    return api.get('/evaluation-analysis', { params })
  },

  // Get single evaluation analysis result
  getAnalysisResult(id) {
    return api.get(`/evaluation-analysis/${id}`)
  },

  // Get analysis results by analysis tag ID
  getAnalysisByTag(analysisTagId, params = {}) {
    return api.get(`/evaluation-analysis/by-tag/${analysisTagId}`, { params })
  },

  // Get overall analysis statistics
  getStatistics() {
    return api.get('/evaluation-analysis/statistics')
  },

  // Get analysis statistics by analysis tag ID
  getStatisticsByTag(analysisTagId) {
    return api.get(`/evaluation-analysis/statistics/by-tag/${analysisTagId}`)
  },

  // Delete evaluation analysis result
  deleteAnalysisResult(id) {
    return api.delete(`/evaluation-analysis/${id}`)
  }
} 