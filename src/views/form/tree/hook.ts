import { reactive, toRaw } from 'vue'

export interface TreeHookOptions<T> {
  childrenKey?: string
  pathBase?: TreePath
  onDirty?: (item: T) => void
}

export type TreePath = (string | number)[]

export const ParentNodeKey: symbol = Symbol('parent')
export const RootNodeKey: symbol = Symbol('root')
export const NodeIndexKey: symbol = Symbol('index')

export function useTreeHook<T extends Record<PropertyKey, any> = Record<PropertyKey, any>>(
  options: TreeHookOptions<T> = {},
) {
  const { childrenKey = 'children', pathBase = [], onDirty = () => {} } = options

  const patchCache = reactive(new WeakMap<T, TreePath>())

  function _dirty(list: T[], startIndex: number) {
    const stack = []

    for (let i = startIndex; i < list.length; i++) {
      const item = list[i] as Record<PropertyKey, any>
      item[NodeIndexKey] = i
      stack.push(item)
    }

    while (stack.length) {
      const item = toRaw(stack.pop()!)
      if (!patchCache.has(item)) return

      patchCache.delete(item)

      const children = item[childrenKey] as T[] | void
      if (children?.length) {
        stack.push(...children)
      }

      onDirty(item)
    }
  }

  /**
   * 添加节点
   * @param target 被添加的目标（根集合或目标节点）
   * @param item 添加的节点
   * @param beforeIndex 添加的位置
   */
  function add(target: T | T[], item: T, beforeIndex = -1) {
    const isChildren = !Array.isArray(target)

    if (NodeIndexKey in item) del(item)

    let children: T[] | void

    if (isChildren) {
      children = target[childrenKey]
      if (!children) {
        children = (target as any)[childrenKey] = []
      }
    } else {
      children = target
    }

    let index = beforeIndex
    if (beforeIndex >= 0 && beforeIndex < children.length - 1) {
      children.splice(beforeIndex, 0, item)
      _dirty(children, beforeIndex + 1)
    } else {
      index = children.push(item) - 1
    }

    ;(item as any)[NodeIndexKey] = index
    ;(item as any)[isChildren ? ParentNodeKey : RootNodeKey] = target
  }

  /**
   * 移除节点
   * @param item 节点
   * @returns 成功移除
   */
  function del(item: T) {
    const children = container(item)

    if (children?.length) {
      const index = item[NodeIndexKey]
      if (~index) {
        delete item[ParentNodeKey]
        delete item[RootNodeKey]
        delete item[NodeIndexKey]

        children.splice(index, 1)
        _dirty(children, index)
        return true
      }
    }
    return false
  }

  /**
   * 获取节点所在父级的数组
   * @param item 节点
   */
  function container(item: T) {
    let children: T[] | void = item[RootNodeKey]

    if (!children) {
      const parentNode = item[ParentNodeKey] as T | void
      if (parentNode) {
        children = parentNode[childrenKey]
      }
    }

    return children
  }

  /**
   * 获取当前节点的取值路径
   * @param item 节点
   * @param base 根节点的取值路径
   */
  function path(item: T, base: TreePath = pathBase): TreePath {
    const raw = toRaw(item)
    let _path = patchCache.get(raw)
    if (!_path) {
      const parentNode = item[ParentNodeKey] as T | void
      const index = item[NodeIndexKey]
      if (parentNode) {
        _path = [...path(parentNode, base), childrenKey, index]
      } else {
        _path = [...base, index]
      }
      patchCache.set(raw, _path)
    }
    return _path
  }

  /**
   * 获取当前节点的兄弟节点集合
   * @param item 节点
   */
  function sibling(item: T) {
    const list = container(item)
    if (!list?.length) return []

    return list.filter((_, i) => item[NodeIndexKey] !== i)
  }

  /**
   * 获取当前节点的兄弟节点路径集合
   * @param item 节点
   * @param descendant 后代路径
   */
  function siblingPath(item: T, descendant: TreePath = []): TreePath[] {
    const list = sibling(item)
    if (!list.length) return []

    let bpath = path(item)
    bpath = bpath.slice(0, bpath.length - 1)

    return list.map((_item) => [...bpath, _item[NodeIndexKey], ...descendant])
  }

  /**
   * 节点序列号
   * @param list 节点集合
   * @param parentNode 节点的上级节点
   */
  function normalize(list: T[], parentNode: T | T[]) {
    const isChildren = !Array.isArray(parentNode)

    list.forEach((item, index) => {
      ;(item as any)[NodeIndexKey] = index
      ;(item as any)[isChildren ? ParentNodeKey : RootNodeKey] = parentNode

      const children = item[childrenKey] as T[] | void
      if (children?.length) normalize(children, item)
    })
  }

  return { add, del, path, container, sibling, siblingPath, normalize }
}
