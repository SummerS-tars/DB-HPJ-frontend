import api from './api'

export const rawQuestionApi = {
  // Import raw questions
  importQuestions(file, sourcePlatform = 'stackoverflow') {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/raw-questions/import?sourcePlatform=${sourcePlatform}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
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
  }
}

export const rawAnswerApi = {
  // Import raw answers
  importAnswers(file, sourcePlatform = 'stackoverflow') {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/raw-answers/import?sourcePlatform=${sourcePlatform}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Get raw answers list
  getAnswers(params = {}) {
    return api.get('/raw-answers', { params })
  }
} 