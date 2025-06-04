import api from './api'

export const versionApi = {
  // Create new version
  createVersion(version) {
    return api.post('/versions', { version })
  },

  // Get all versions
  getVersions() {
    return api.get('/versions')
  }
}

export const tagApi = {
  // Create new tag
  createTag(tag) {
    return api.post('/tags', { tag })
  },

  // Get all tags
  getTags() {
    return api.get('/tags')
  }
}

export const standardQuestionApi = {
  // Import standard questions
  importQuestions(questions) {
    return api.post('/std-questions/import', questions)
  },

  // Get standard questions list
  getQuestions(params = {}) {
    return api.get('/std-questions', { params })
  },

  // Get single standard question
  getQuestion(id) {
    return api.get(`/std-questions/${id}`)
  },

  // Add tag to standard question
  addTag(id, tagName) {
    return api.post(`/std-questions/${id}/tags`, { tagName })
  },

  // Remove tag from standard question
  removeTag(id, tagName) {
    return api.delete(`/std-questions/${id}/tags/${tagName}`)
  }
} 