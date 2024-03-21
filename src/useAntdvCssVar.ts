import { watch } from 'vue'
import { theme } from 'ant-design-vue'
import { kebabCase } from 'change-case'
import { css } from '@emotion/css'

import type { UnwrapRef } from 'vue'
import type { GlobalToken } from 'ant-design-vue/es/theme'
import type { CSSInterpolation } from '@emotion/css'

export const defaultGlobalCssVarScope = '--css-global-theme-var'

export const defaultIgnoreVar = (token: string) => !/^[a-z]/.test(token)

/**
 * 缓存的 css 变量转换
 */
export const TokenToCssVarStore: Record<string, string> = {}

export interface GlobalCssVarOptions {
  scope: string
  ignoreVar: (token: string) => boolean
}

/**
 * 创建全局 css 变量
 * @param cssVars 附加的 css 变量
 * @param options
 */
export function useGlobalCssVar(cssVars?: Record<string, string>, options?: Partial<GlobalCssVarOptions>) {
  const { scope = defaultGlobalCssVarScope, ignoreVar = defaultIgnoreVar } = options || {}

  const { token } = theme.useToken()

  const useCssVar = () => {
    const element = getGlobalCssVarElement(scope)

    const text = getCssVarContent(Object.assign(token.value, cssVars), ignoreVar)

    element.innerHTML = text
  }

  watch(
    token,
    () => {
      useCssVar()
    },
    {
      immediate: true,
    },
  )
}

type ThemeToken = UnwrapRef<ReturnType<typeof theme.useToken>['token']>

/**
 * 自定义 css 变量声明
 */
export interface CustomCssVar {}

interface UserCssVar extends CustomCssVar, ThemeToken {}

export type GenVarCSSInterpolation = (token: UserCssVar) => CSSInterpolation | CSSInterpolation[]

/**
 * 应用 ant-design-vue css 变量
 * @param genVarCss
 */
export function useAntdvCssVar(genVarCss: GenVarCSSInterpolation) {
  return css(genVarCss(TokenToCssVarStore as unknown as UserCssVar))
}

function getGlobalCssVarElement(scope: string) {
  const element = document.querySelector(`.${scope}`) as HTMLStyleElement | null

  if (!element) {
    const style = document.createElement('style')

    style.className = scope

    document.head.appendChild(style)

    return style
  }

  return element
}

function getCssVarContent(token: GlobalToken, ignore: GlobalCssVarOptions['ignoreVar']) {
  const cssVars: string[] = []

  for (const key in token) {
    if (Object.prototype.hasOwnProperty.call(token, key)) {
      if (ignore(key))
        continue

      const kebabKey = `--${kebabCase(key)}`

      if (!TokenToCssVarStore[key])
        TokenToCssVarStore[key] = `var(${kebabKey})`

      cssVars.push(`  ${kebabKey}: ${token[key as keyof GlobalToken]};`)
    }
  }

  return `:root {\n${cssVars.join('\n')}\n}`
}
