import { computed, watch } from 'vue'
import { theme } from 'ant-design-vue'
import { kebabCase } from 'change-case'
import { css } from '@emotion/css'

import type { CSSInterpolation } from '@emotion/css'
import type { AliasToken } from 'ant-design-vue/es/theme/interface'

export const defaultGlobalCssVarScope = '--css-global-theme-var'

export const defaultIgnoreVar = (token: string) => !/^[a-z]/.test(token)

export function defaultSuffix(token: string, value: any) {
  if (typeof value === 'number' && !/^((zIndex)|(lineHeight)|(fontWeight)|(opacity)|(motion))/.test(token))
    return `${value}px`

  return value
}

/**
 * 缓存的 css 变量转换
 */
export const TokenToCssVarStore: Record<string, string> = {}

/**
 * 自定义 css 变量声明
 */
export interface CustomCssVar {}

interface UserCssVar extends CustomCssVar, AliasToken {}

export interface GlobalCssVarOptions {
  scope: string
  prefixVar: string
  ignoreVar: (token: string) => boolean
  suffix: (token: string, value: any) => string | number
}

/**
 * 创建全局 css 变量
 * @param cssVars 附加的 css 变量
 * @param options
 */
export function useGlobalCssVar(cssVars?: Record<string, string>, options?: Partial<GlobalCssVarOptions>) {
  const {
    scope = defaultGlobalCssVarScope,
    prefixVar = 'ant',
    ignoreVar = defaultIgnoreVar,
    suffix = defaultSuffix,
  } = options || {}

  const { token } = theme.useToken()

  const useCssVar = (token: UserCssVar) => {
    const element = getGlobalCssVarElement(scope)

    const text = getCssVarContent(token, { prefixVar, ignoreVar, suffix })

    element.innerHTML = text
  }

  const globalToken = computed<UserCssVar>(() => Object.assign(token.value, cssVars))

  watch(
    globalToken,
    (token) => {
      useCssVar(token)
    },
    {
      immediate: true,
      deep: true,
    },
  )
}

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

export interface CssVarContentOptions extends Omit<GlobalCssVarOptions, 'scope'> {}

function getCssVarContent(token: AliasToken, options: CssVarContentOptions) {
  const { prefixVar, ignoreVar, suffix } = options

  const cssVars: string[] = []

  for (const key in token) {
    if (Object.prototype.hasOwnProperty.call(token, key)) {
      if (ignoreVar(key))
        continue

      const kebabKey = `--${prefixVar}-${kebabCase(key)}`

      const value = suffix(key, token[key as keyof AliasToken])

      if (!TokenToCssVarStore[key])
        TokenToCssVarStore[key] = `var(${kebabKey})`

      cssVars.push(`  ${kebabKey}: ${value};`)
    }
  }

  return `:root {\n${cssVars.join('\n')}\n}`
}
