import api from './api'

export const candidateAnswerApi = {
  // Import candidate answers
  importAnswers(file, type) {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/candidate-answers/import?type=${type}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Get candidate answers list
  getAnswers(params = {}) {
    return api.get('/candidate-answers', { params })
  },

  // Get candidate answers for a specific question
  getAnswersForQuestion(questionId, params = {}) {
    return api.get(`/std-questions/${questionId}/candidate-answers`, { params })
  },

  // Update candidate answer status
  updateAnswer(id, data) {
    return api.patch(`/candidate-answers/${id}`, data)
  }
}

export const standardAnswerApi = {
  // Get standard answers list
  getAnswers(params = {}) {
    return api.get('/std-answers', { params })
  },

  // Get standard answers for a specific question
  getAnswersForQuestion(questionId, params = {}) {
    return api.get(`/std-questions/${questionId}/std-answers`, { params })
  },

  // Update standard answer
  updateAnswer(id, data) {
    return api.patch(`/std-answers/${id}`, data)
  }
} 