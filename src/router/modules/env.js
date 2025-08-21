import Layout from '@/layout'

const envRouter = {
  path: '/env',
  component: Layout,
  hidden: true,
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
      hidden: true
    }
  ]
}
export default envRouter
