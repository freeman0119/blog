# keep-alive 实现原理

## 基本概念

keep-alive 是 Vue 提供的一个内置组件，用来缓存组件的状态，避免在切换组件时重新渲染和销毁，从而提高性能。

```vue
<template>
  <keep-alive>
    <component :is="currentComponent" />
  </keep-alive>
</template>
```

Vue 3 的 keep-alive 的缓存机制原理如下：

- 缓存池：keep-alive 内部使用一个 Map 存储已渲染的组件实例，键通常是组件的 key（或 name）。

- 激活与挂起：如果组件切换时已经缓存，直接复用缓存的组件实例；如果组件未缓存，则渲染并缓存新的组件实例。 此外，keep-alive 还会激活特殊的钩子函数：

- 当组件被缓存时，会触发 deactivated 钩子。

- 当组件从缓存中恢复时，会触发 activated 钩子。

## 核心实现原理

keep-alive 的核心就是一个缓存机制，通过内存中保存组件的虚拟节点（VNode）来避免重复创建和销毁组件实例。

一个简化的实现如下：

```js
const KeepAliveImpl = {
  name: "KeepAlive",

  // 缓存存储：使用 Map 数据结构存储已缓存的组件
  _cache: new Map(), // 主缓存池，存储所有缓存的组件 VNode
  _activeCache: new Map(), // 活跃缓存池，跟踪当前正在使用的缓存组件

  render() {
    // 1. 获取要渲染的组件 VNode
    // keep-alive 的插槽中只能有一个直接子组件
    const vnode = this.$slots.default()[0];

    // 2. 生成缓存 key
    // 优先使用组件的 key 属性，否则使用组件名称作为缓存标识
    const key = vnode.key || vnode.type.name;

    // 3. 检查缓存
    if (this._cache.has(key)) {
      // 缓存命中：从缓存中获取已保存的组件 VNode
      const cachedVnode = this._cache.get(key);

      // 将组件标记为活跃状态
      this._activeCache.set(key, cachedVnode);

      // 返回缓存的 VNode，此时不会重新创建组件实例
      // Vue 会复用之前的组件实例，保持其状态
      return cachedVnode;
    } else {
      // 缓存未命中：首次渲染此组件，直接返回原始 VNode
      // Vue 会正常创建新的组件实例
      return vnode;
    }
  },

  mounted() {
    // 组件挂载后，将当前组件 VNode 加入缓存
    const key = this.$vnode.key;

    // 避免重复缓存同一个组件
    if (!this._cache.has(key)) {
      this._cache.set(key, this.$vnode);
    }
  },

  beforeDestroy() {
    // 组件销毁前，清理缓存中的对应项
    const key = this.$vnode.key;
    this._cache.delete(key);

    // 这里需要注意：在实际的 Vue 实现中，
    // keep-alive 组件本身销毁时才会清理所有缓存
    // 单个被缓存的组件切换时不会触发此钩子
  },
};
```

## 缓存的生命周期

当组件被 keep-alive 包裹时，其生命周期发生了变化：

**首次渲染**：

1. 组件正常执行 created → mounted 生命周期
2. 组件 VNode 被缓存到 `_cache` 中

**离开组件**： 3. 组件实例不会被销毁，而是被"停用" 4. 触发 `deactivated` 钩子（而不是 beforeDestroy/destroyed）

**再次进入**： 5. 从缓存中取出组件 VNode 6. 组件实例被"激活"，触发 `activated` 钩子 7. 跳过重新创建过程，直接复用之前的状态

**最终销毁**： 8. 只有当 keep-alive 组件本身被销毁时，缓存的组件才会真正被清理
