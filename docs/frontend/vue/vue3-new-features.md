# Vue3 新特性

## 🚀 Composition API

### setup() 函数

```javascript
// Vue 2 Options API
export default {
  data() {
    return { count: 0 }
  },
  methods: {
    increment() { this.count++ }
  }
}

// Vue 3 Composition API
import { ref } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const increment = () => count.value++

    return { count, increment }
  }
}
```

### `<script setup>` 语法糖

```vue
<template>
  <button @click="increment">{{ count }}</button>
</template>

<script setup>
import { ref } from "vue";

const count = ref(0);
const increment = () => count.value++;

// Props
const props = defineProps({
  title: String,
});

// Emits
const emit = defineEmits(["update"]);
</script>
```

## 🎯 响应式系统升级

### Proxy 替代 Object.defineProperty

```javascript
// Vue 3 - 支持所有操作
const state = reactive({
  items: ["a", "b"],
});

state.items[0] = "x"; // ✅ 可检测
state.items.length = 0; // ✅ 可检测
state.newProp = "new"; // ✅ 可检测
```

### ref 和 reactive

```javascript
// 基本类型使用 ref
const count = ref(0);
console.log(count.value); // 需要 .value

// 对象类型使用 reactive
const state = reactive({
  user: { name: "Vue" },
});
console.log(state.user.name); // 直接访问
```

## 🧩 新的内置组件

### Teleport

```vue
<template>
  <Teleport to="body">
    <div class="modal" v-if="showModal">模态框内容</div>
  </Teleport>
</template>
```

### Suspense

```vue
<template>
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <div>加载中...</div>
    </template>
  </Suspense>
</template>
```

### Fragment (多根节点)

```vue
<!-- Vue 3 支持多根节点 -->
<template>
  <header>Header</header>
  <main>Main</main>
  <footer>Footer</footer>
</template>
```

## ⚡ 性能优化

### 静态提升

```vue
<template>
  <div>
    <h1>静态标题</h1>
    <!-- 会被提升 -->
    <p>{{ dynamicText }}</p>
  </div>
</template>
```

### Tree-shaking 支持

```javascript
// 按需导入，未使用的 API 不会被打包
import { ref, computed } from "vue";
```

## 🛠️ 开发体验

### 更好的 TypeScript 支持

```typescript
<script setup lang="ts">
interface Props {
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})

const emit = defineEmits<{
  update: [value: number]
}>()
</script>
```

### 多个 v-model

```vue
<CustomInput v-model:name="form.name" v-model:email="form.email" />
```

## 🔄 其他重要特性

### watchEffect

```javascript
import { watchEffect } from "vue";

watchEffect(() => {
  console.log(`count is: ${count.value}`);
});
```

### 全局 API 变更

```javascript
// Vue 2
import Vue from "vue";
Vue.component("MyComponent", {});

// Vue 3
import { createApp } from "vue";
const app = createApp({});
app.component("MyComponent", {});
```
