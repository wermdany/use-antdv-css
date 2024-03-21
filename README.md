# use-antdv-css

更加简单的消费 `ant-design-vue` 的主题 `token`

在应用 `ant-design-vue` 开发多主题应用时，在大量应用的主题 `token` 时比较繁琐，此方案可以提高效率

## 方案

应用 `@emotion/css` 实现 cssinjs

## 应用

目前提供两种方案

### 直接应用

直接消费 `ant-design-vue` 的 `token`

此方案会在主题 `token` 变化时，插入新的 style 标签实现，无论是重新计算样式还是插入多个标签，都是巨大的性能损耗

下面这个例子会在切换主题时，插入两个主题的 style 标签，当多个组件都应用时，并且频繁切换品牌色，性能和标签数量将是一个灾难

```vue
<script setup lang="ts">
import { useAntdvCss } from 'use-antdv-css'

import { useSystemStore } from '@/store'

const system = useSystemStore()

const css = useAntdvCss(token => ({
  color: token.colorText,
}))

function handleSwitchMode() {
  system.changeThemeMode(system.mode === 'dark' ? 'light' : 'dark')
}
</script>

<template>
  <div>
    <p :class="css">
      one two three
    </p>
    <button @click="handleSwitchMode">
      Switch Theme Mode
    </button>
  </div>
</template>
```

### 使用 CSS Var

应用 `useGlobalCssVar` 在应用比较早的时刻调用注册全局 CSS 变量

```vue
<script setup lang="ts">
import { useGlobalCssVar } from 'use-antdv-css'

useGlobalCssVar()
</script>

<template>
  <ConfigProvider>
    <router-view />
  </ConfigProvider>
</template>

<style></style>
```

在组件和页面中消费 `token`

```vue
<script setup lang="ts">
import { useAntdvCssVar } from 'use-antdv-css'

defineOptions({
  name: 'EditerLayout'
})

const css = useAntdvCssVar(token => ({
  color: token.colorText,
}))
</script>

<template>
  <div :class="css">
    one two three
  </div>
</template>
```

应用这种方案，会在全局注册变量，并且把 `ant-design-vue` 的 `token` 转化为 CSS 变量形式消费，在频繁切换主题模式和品牌色时，只会进行更改全局的 CSS 变量，而次级组件和页面不会发生任何改变，从而解决上述的问题

## 自定义全局变量

 `useGlobalCssVar` 拥有第一个参数，可以自己填入你需要的变量注册到全局

 当你自己注册了全局样式时，为了让 `useAntdvCssVar` 能够提供提示，你需要一下操作

```ts
declare module 'use-antdv-css' {
  export interface CustomCssVar {
    /** 自定义头部栏高度 */
    headerHeight: string
  }
}
```

这样就可以 `useAntdvCssVar` 应用自定义 `token`

## 警告

由于 `ant-design-vue` token 本身的原因 提供的 并不包含单位，考虑到处理 300+ 变量单位和计算问题，在使用 `useAntdvCssVar` 时需要自己处理单位，比如 `font-size` 等

自定义的变量自己按需处理

## 灵感

来源于 [use-emotion-css](https://github.com/ant-design/use-emotion-css)

## 后续

长远来看 `ant-design-vue` 后续也会切换到 CSS 变量方案，因为 `ant-design` 已经在 `5.12.0` 进行了[融合](https://ant-design.antgroup.com/docs/react/css-variables-cn)，后续会跟进

Vue 使用 cssinjs 方案书写样式是一个比较麻烦的方式，但是在兼顾提示和性能下，方便的使用 `ant-design-vue` 是一个问题
