/// <reference types="vite/client" />

import 'vue-router'

import type { Component } from 'vue'

export {}

declare module 'vue-router' {
  interface RouteMeta {
    title: string
    subtitle?: string
    icon?: Component
  }
}
