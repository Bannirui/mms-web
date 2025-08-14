import Layout from '@/layout'

const topicRouter = {
  path: '/topic',
  component: Layout,
  redirect: 'noredirect',
  name: 'Topic',
  meta: {
    title: 'Topic',
    icon: 'topic'
  },
  children: [
    {
      path: 'list',
      component: () => import('@/views/topic/list.vue'),
      name: 'TopicList',
      meta: { title: '主题管理' }
    },
    {
      path: 'detail/:id(\\d+)',
      component: () => import('@/views/topic/detail/index.vue'),
      name: 'TopicDetail',
      meta: { title: 'Topic Detail', noCache: true, activeMenu: '/topic/list' },
      hidden: true
    }
  ]
}
export default topicRouter
