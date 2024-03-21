# use-antdv-css

use antdv css token

```vue
<script setup lang="ts">
import { useAntdvCss } from 'use-antdv-css'

import { useSystemStore } from '@/store'

defineOptions({
  name: 'Editer'
})

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
