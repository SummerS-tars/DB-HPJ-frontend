import { defineStore } from 'pinia'
import { versionApi, tagApi } from '@/services/standardData'

export const useCommonStore = defineStore('common', {
  state: () => ({
    versions: [],
    tags: [],
    loading: {
      versions: false,
      tags: false
    }
  }),

  getters: {
    versionOptions: (state) => state.versions.map(v => ({ label: v.version, value: v.version })),
    tagOptions: (state) => state.tags.map(t => ({ label: t.tag, value: t.tag }))
  },

  actions: {
    async fetchVersions() {
      this.loading.versions = true
      try {
        const response = await versionApi.getVersions()
        this.versions = response.data
      } catch (error) {
        console.error('Failed to fetch versions:', error)
      } finally {
        this.loading.versions = false
      }
    },

    async fetchTags() {
      this.loading.tags = true
      try {
        const response = await tagApi.getTags()
        this.tags = response.data
      } catch (error) {
        console.error('Failed to fetch tags:', error)
      } finally {
        this.loading.tags = false
      }
    },

    async createVersion(version) {
      try {
        const response = await versionApi.createVersion(version)
        this.versions.push(response.data)
        return response.data
      } catch (error) {
        console.error('Failed to create version:', error)
        throw error
      }
    },

    async createTag(tag) {
      try {
        const response = await tagApi.createTag(tag)
        this.tags.push(response.data)
        return response.data
      } catch (error) {
        console.error('Failed to create tag:', error)
        throw error
      }
    }
  }
}) 