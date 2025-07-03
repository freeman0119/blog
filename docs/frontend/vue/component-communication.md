# Vue 中组件通讯方式

## 父子组件通信

### Props + Emit

最基础的通信方式：

```vue
<!-- 父组件 -->
<template>
  <ChildComponent :message="parentMsg" @update="handleUpdate" />
</template>

<script setup>
import { ref } from "vue";

const parentMsg = ref("Hello");
const handleUpdate = (newMsg) => {
  parentMsg.value = newMsg;
};
</script>

<!-- 子组件 -->
<template>
  <div>
    <p>{{ message }}</p>
    <button @click="$emit('update', 'Updated!')">更新</button>
  </div>
</template>

<script setup>
defineProps(["message"]);
defineEmits(["update"]);
</script>
```

### v-model 双向绑定

```vue
<!-- 父组件 -->
<template>
  <CustomInput v-model="inputValue" />
</template>

<!-- 子组件 -->
<template>
  <input
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

<script setup>
defineProps(["modelValue"]);
defineEmits(["update:modelValue"]);
</script>
```

### 多个 v-model

```vue
<!-- 父组件 -->
<template>
  <UserForm v-model:name="user.name" v-model:email="user.email" />
</template>

<!-- 子组件 -->
<template>
  <div>
    <input :value="name" @input="$emit('update:name', $event.target.value)" />
    <input :value="email" @input="$emit('update:email', $event.target.value)" />
  </div>
</template>

<script setup>
defineProps(["name", "email"]);
defineEmits(["update:name", "update:email"]);
</script>
```

## 跨层级通信

### provide/inject

适用于祖先与后代组件通信：

```javascript
// 祖先组件
<script setup>
import { provide, ref } from 'vue'

const theme = ref('light')
const user = ref({ name: 'Vue' })

provide('theme', theme)
provide('user', user)
provide('updateTheme', () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
})
</script>

// 后代组件 (可以跨多层)
<script setup>
import { inject } from 'vue'

const theme = inject('theme')
const user = inject('user')
const updateTheme = inject('updateTheme')
</script>
```

### 响应式 provide/inject

```javascript
// 祖先组件
<script setup>
import { provide, reactive } from 'vue'

const state = reactive({
  user: { name: 'Vue', role: 'admin' },
  settings: { theme: 'light' }
})

const updateUser = (newUser) => {
  Object.assign(state.user, newUser)
}

provide('appState', state)
provide('updateUser', updateUser)
</script>

// 后代组件
<script setup>
import { inject } from 'vue'

const appState = inject('appState')
const updateUser = inject('updateUser')

// 响应式数据，会自动更新
console.log(appState.user.name)
</script>
```

## 兄弟组件通信

### Event Bus

```javascript
// eventBus.js
import mitt from 'mitt'
export const eventBus = mitt()

// 组件 A
<script setup>
import { eventBus } from './eventBus'

const sendMessage = () => {
  eventBus.emit('message', 'Hello from A')
}
</script>

// 组件 B
<script setup>
import { onMounted, onUnmounted } from 'vue'
import { eventBus } from './eventBus'

const handleMessage = (data) => {
  console.log('Received:', data)
}

onMounted(() => {
  eventBus.on('message', handleMessage)
})

onUnmounted(() => {
  eventBus.off('message', handleMessage)
})
</script>
```

### 共同的父组件

```vue
<!-- 父组件作为中介 -->
<template>
  <ComponentA @data-change="handleDataChange" />
  <ComponentB :shared-data="sharedData" />
</template>

<script setup>
import { ref } from "vue";

const sharedData = ref("");

const handleDataChange = (newData) => {
  sharedData.value = newData;
};
</script>
```

## 全局状态管理

### Pinia

```javascript
// stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)

  const setUser = (newUser) => {
    user.value = newUser
  }

  const clearUser = () => {
    user.value = null
  }

  return { user, setUser, clearUser }
})

// 任何组件中使用
<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const { user, setUser } = userStore
</script>
```

## 特殊通信方式

### ref 直接调用

```vue
<!-- 父组件 -->
<template>
  <ChildComponent ref="childRef" />
  <button @click="callChild">调用子组件方法</button>
</template>

<script setup>
import { ref } from "vue";

const childRef = ref();

const callChild = () => {
  childRef.value?.childMethod();
};
</script>

<!-- 子组件 -->
<script setup>
const childMethod = () => {
  console.log("子组件方法被调用");
};

defineExpose({
  childMethod,
});
</script>
```

## 总结

| 通信方式       | 使用场景 | 优点         | 缺点         |
| -------------- | -------- | ------------ | ------------ |
| Props/Emit     | 父子组件 | 简单明确     | 层级深时繁琐 |
| v-model        | 双向绑定 | 简化语法     | 仅适用表单   |
| provide/inject | 跨层级   | 避免逐层传递 | 来源不明确   |
| Event Bus      | 兄弟组件 | 灵活解耦     | 难以调试     |
| Pinia          | 全局状态 | 功能强大     | 增加复杂度   |
| ref            | 直接调用 | 简单直接     | 破坏封装     |
