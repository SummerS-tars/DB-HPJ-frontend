import { createRouter, createWebHistory } from 'vue-router'

// Import views
import Home from '@/views/Home.vue'
import RawQuestionList from '@/views/RawData/RawQuestionList.vue'
import RawAnswerList from '@/views/RawData/RawAnswerList.vue'
import StackOverflowPostIds from '@/views/RawData/StackOverflowPostIds.vue'
import VersionManage from '@/views/StandardData/VersionManage.vue'
import TagManage from '@/views/StandardData/TagManage.vue'
import StandardQuestionList from '@/views/StandardData/StandardQuestionList.vue'
import CandidateAnswerList from '@/views/CandidateAnswer/CandidateAnswerList.vue'
import StandardAnswerList from '@/views/StandardAnswer/StandardAnswerList.vue'
import EvaluationTagManage from '@/views/Evaluation/EvaluationTagManage.vue'
import EvaluationResultList from '@/views/Evaluation/EvaluationResultList.vue'
import AnalysisTagManage from '@/views/Analysis/AnalysisTagManage.vue'
import EvaluationAnalysisList from '@/views/Analysis/EvaluationAnalysisList.vue'
import Dashboard from '@/views/Statistics/Dashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    // Raw Data Routes
    {
      path: '/raw-questions',
      name: 'raw-questions',
      component: RawQuestionList
    },
    {
      path: '/raw-answers',
      name: 'raw-answers',
      component: RawAnswerList
    },
    {
      path: '/stackoverflow-post-ids',
      name: 'stackoverflow-post-ids',
      component: StackOverflowPostIds
    },
    // Standard Data Routes
    {
      path: '/versions',
      name: 'versions',
      component: VersionManage
    },
    {
      path: '/tags',
      name: 'tags',
      component: TagManage
    },
    {
      path: '/std-questions',
      name: 'std-questions',
      component: StandardQuestionList
    },
    // Answer Routes
    {
      path: '/candidate-answers',
      name: 'candidate-answers',
      component: CandidateAnswerList
    },
    {
      path: '/std-answers',
      name: 'std-answers',
      component: StandardAnswerList
    },
    // Evaluation Routes
    {
      path: '/evaluation-tags',
      name: 'evaluation-tags',
      component: EvaluationTagManage
    },
    {
      path: '/evaluation-results',
      name: 'evaluation-results',
      component: EvaluationResultList
    },
    // Analysis Routes
    {
      path: '/analysis-tags',
      name: 'analysis-tags',
      component: AnalysisTagManage
    },
    {
      path: '/evaluation-analysis',
      name: 'evaluation-analysis',
      component: EvaluationAnalysisList
    },
    // Statistics Route
    {
      path: '/statistics',
      name: 'statistics',
      component: Dashboard
    }
  ]
})

export default router 