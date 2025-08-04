<template>
  <div class="form-view">
    <MenuComp :menus="menus" />
    <div class="form-view__body">
      <h2>{{ title }}</h2>
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { MenuComp, routesToMenu } from '@/components/menu'

import routes from './routes.ts'

const menus = routesToMenu(routes)

const route = useRoute()
const title = computed(() => {
  const { title, subtitle } = route.meta
  return subtitle ?? title ?? route.name
})
</script>

<style lang="scss" scoped>
.form-view {
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template-columns: 220px 1fr;
}

.form-view__body {
  padding: 30px 60px;
}
</style>
