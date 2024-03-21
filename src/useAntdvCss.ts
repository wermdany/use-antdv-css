import { computed } from 'vue'
import { theme } from 'ant-design-vue'
import { css } from '@emotion/css'

import type { CSSInterpolation } from '@emotion/css'
import type { AliasToken } from 'ant-design-vue/es/theme/interface'

export type GenCSSInterpolation = (token: AliasToken) => CSSInterpolation | CSSInterpolation[]

/**
 * 应用 ant-design-vue css token
 * @param genCss
 */
export function useAntdvCss(genCss: GenCSSInterpolation) {
  const { token } = theme.useToken()

  return computed(() => css(genCss(token.value)))
}
