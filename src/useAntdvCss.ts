import { computed } from 'vue'
import { theme } from 'ant-design-vue'
import { css } from '@emotion/css'

import type { UnwrapRef } from 'vue'
import type { CSSInterpolation } from '@emotion/css'

type ThemeToken = UnwrapRef<ReturnType<typeof theme.useToken>['token']>

export type GenCSSInterpolation = (token: ThemeToken) => CSSInterpolation | CSSInterpolation[]

export function useAntdvCss(genCss: GenCSSInterpolation) {
  const { token } = theme.useToken()

  return computed(() => css(genCss(token.value)))
}
