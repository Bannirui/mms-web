import Layout from '@/layout'

const envRouter = {
  path: '/env',
  component: Layout,
  redirect: 'noredirect',
  name: 'Env',
  meta: {
    title: 'Env',
    icon: 'env'
  },
  children: [
    {
      path: 'list',
      component: () => import('@/views/env/list.vue'),
      name: 'EnvList',
      meta: { title: '环境管理' }
    }
  ]
}
export default envRouter
