import api from './api'

export const rawQuestionApi = {
  // Import raw questions
  importQuestions(file, sourcePlatform = 'stackoverflow') {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/raw-questions/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      params: { sourcePlatform }
    })
  },

  // Get raw questions list with pagination
  getQuestions(params = {}) {
    return api.get('/raw-questions', { params })
  },

  // Get single raw question
  getQuestion(id) {
    return api.get(`/raw-questions/${id}`)
  },

  // Update raw question status
  updateStatus(id, status) {
    return api.patch(`/raw-questions/${id}/status`, { status })
  },

  // Get answers for a raw question
  getAnswers(questionId, params = {}) {
    return api.get(`/raw-questions/${questionId}/answers`, { params })
  },

  // Get standard questions converted from raw question
  getStandardQuestions(rawQuestionId, params = {}) {
    return api.get(`/raw-questions/${rawQuestionId}/std-questions`, { params })
  },

  // StackOverflow Post IDs API methods
  // Get StackOverflow post IDs without answers (with metadata)
  getStackOverflowPostIds() {
    return api.get('/raw-questions/stackoverflow/post-ids-without-answers')
  },

  // Download StackOverflow post IDs (full format with metadata)
  downloadStackOverflowPostIds() {
    return api.get('/raw-questions/stackoverflow/post-ids-without-answers/download', {
      responseType: 'blob'
    })
  },

  // Download StackOverflow post IDs (simple format matching document specification)
  downloadStackOverflowPostIdsSimple() {
    return api.get('/raw-questions/stackoverflow/post-ids-simple', {
      responseType: 'blob'
    })
  },

  // Export raw questions for standardization
  exportQuestions(includeConverted = false, limit = null) {
    const params = {}
    
    if (includeConverted) {
      params.includeConverted = 'true'
    }
    
    if (limit && limit > 0) {
      params.limit = limit.toString()
    }
    
    return api.get('/raw-questions/export', {
      params,
      responseType: 'blob'
    })
  }
}

export const rawAnswerApi = {
  // Import raw answers
  importAnswers(file, sourcePlatform = 'stackoverflow') {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/raw-answers/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      params: { sourcePlatform }
    })
  },

  // Get raw answers list
  getAnswers(params = {}) {
    return api.get('/raw-answers', { params })
  },

  // Get single raw answer
  getAnswer(id) {
    return api.get(`/raw-answers/${id}`)
  },

  // Get answers for a raw question
  getAnswersForQuestion(questionId, params) {
    return api.get(`/raw-questions/${questionId}/answers`, { params })
  }
} 