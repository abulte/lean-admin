import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'

import Dataset from '@/views/Dataset.vue'
import DatasetMetadata from '@/components/dataset/Metadata.vue'
import DatasetResources from '@/components/dataset/Resources.vue'
import DatasetAdvancedMetadata from '@/components/dataset/AdvancedMetadata.vue'
import DatasetDescription from '@/components/dataset/Description.vue'
import ResourcesList from '@/components/dataset/ResourcesList.vue'
import Resource from '@/components/resource/Resource.vue'
import ResourceMetadata from '@/components/resource/ResourceMetadata.vue'
import ResourceFile from '@/components/resource/ResourceFile.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/dataset/:id',
    component: Dataset,
    children: [
      {
        path: '',
        component: DatasetMetadata
      },
      {
        path: 'advanced',
        component: DatasetAdvancedMetadata
      },
      {
        path: 'description',
        component: DatasetDescription
      },
      {
        path: 'resources',
        component: DatasetResources,
        children: [
          {
            path: '',
            component: ResourcesList
          },
          {
            path: ':rid',
            component: Resource,
            children: [
              {
                path: '',
                component: ResourceMetadata
              },
              {
                path: 'file',
                component: ResourceFile
              }
            ]
          }
        ]
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
