import { Tickets } from '@element-plus/icons-vue'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/async-form',
    name: 'AsyncForm',
    component: () => import('./FormView.vue'),
    redirect: { name: 'AsyncTreeFrom' },
    meta: {
      title: '动态表单',
      icon: Tickets,
    },
    children: [
      {
        path: 'tree',
        name: 'AsyncTreeFrom',
        component: () => import('./tree/TreeView.vue'),
        meta: {
          title: '动态树形表单',
          subtitle: '无限级树形动态表单验证与实时关联校验',
        },
      },
    ],
  },
]

export default routes
