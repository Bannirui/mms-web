import Layout from '@/layout'

const consumerRouter = {
  path: '/consumer',
  component: Layout,
  redirect: 'noredirect',
  name: 'Consumer',
  meta: {
    title: 'Consumer',
    icon: 'consumer'
  },
  children: [
    {
      path: 'list',
      component: () => import('@/views/consumer/list.vue'),
      name: 'ConsumerList',
      meta: { title: '消费组管理' }
    }
  ]
}
export default consumerRouter
