import 'element-plus/theme-chalk/base.css'
import 'element-plus/theme-chalk/el-menu.css'
import 'element-plus/theme-chalk/el-menu-item.css'
import 'element-plus/theme-chalk/el-sub-menu.css'

import { ElIcon, ElMenu, ElMenuItem, ElSubMenu } from 'element-plus'
import { type Component, computed, defineComponent, type PropType } from 'vue'
import type { JSX } from 'vue/jsx-runtime'
import { type RouteRecordRaw, useRoute } from 'vue-router'

export interface MenuOption {
  title: string
  subtitle: string
  name: string
  icon?: string
  children: MenuOption[]
}

const icons: Record<string, Component> = {}

export function routesToMenu(routes: RouteRecordRaw[]): MenuOption[] {
  return routes.map(({ name, meta, children }) => {
    const { title, icon, subtitle } = meta ?? {}
    let iconName: string | void = void 0
    if (icon) {
      icons[(iconName = icon.name!)] = icon
    }
    return {
      title: title ?? name!,
      subtitle: subtitle ?? title ?? name,
      name: name!,
      icon: iconName,
      children: Array.isArray(children) ? routesToMenu(children) : [],
    } as MenuOption
  })
}

export const MenuComp = defineComponent({
  name: 'MenuComp',
  props: {
    menus: {
      type: Array as PropType<MenuOption[]>,
      default: () => [],
    },
  },
  setup(props) {
    const route = useRoute()

    function renderMenu({ title, name, children, icon }: MenuOption) {
      let _title: JSX.Element
      if (icon) {
        const _icon = icons[icon] as any
        _title = (
          <>
            <ElIcon>
              <_icon />
            </ElIcon>
            <span>{title}</span>
          </>
        )
      } else {
        _title = <span>{title}</span>
      }

      if (children.length) {
        return (
          <ElSubMenu index={name}>
            {{
              title: _title,
              default: children.map(renderMenu),
            }}
          </ElSubMenu>
        )
      }

      return (
        <ElMenuItem index={name} route={{ name }}>
          {_title}
        </ElMenuItem>
      )
    }

    return () => {
      return (
        <ElMenu router={true} default-active={route.name}>
          {props.menus.map(renderMenu)}
        </ElMenu>
      )
    }
  },
})
