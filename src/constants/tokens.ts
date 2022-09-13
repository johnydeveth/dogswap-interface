import { Currency, Ether, NativeCurrency, Token, WETH9 } from '@uniswap/sdk-core'
import invariant from 'tiny-invariant'

import { UNI_ADDRESS } from './addresses'
import { SupportedChainId } from './chains'

export const SC_SC = new Token(
  SupportedChainId.SHIBCHAIN,
  '0xcA11851D49DDbD9584660A8989AE3838544965A6',
  18,
  'POW',
  'Powswap'
)

export const PUDDLE_SC = new Token(
  SupportedChainId.SHIBCHAIN,
  '0xcA11851D49DDbD9584660A8989AE3838544965A6',
  18,
  'PUDL',
  'Puddle Token'
)

export const SHIB_ETHW = new Token(
  SupportedChainId.SHIBCHAIN,
  '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
  18,
  'SC',
  'SHIBACHAIN'
)


export const UNI: { [chainId: number]: Token } = {
  [SupportedChainId.SHIBCHAIN]: new Token(SupportedChainId.SHIBCHAIN, UNI_ADDRESS[1], 18, 'UNI', 'Uniswap'),
}

export const WRAPPED_NATIVE_CURRENCY: { [chainId: number]: Token | undefined } = {
  ...(WETH9 as Record<SupportedChainId, Token>),
  [SupportedChainId.SHIBCHAIN]: new Token(
    SupportedChainId.SHIBCHAIN,
    '0x94d0DcA5eAE9a6987F15ce91F14154E5b0FDD82F',
    18,
    'WWSHIB',
    'Wrapped WWSHIB'
  ),
}

export function isCelo(chainId: number) {
  return false
}

function getCeloNativeCurrency(chainId: number) {
  throw new Error('Not celo')
}

function isMatic(chainId: number) {
  return false
}

class MaticNativeCurrency extends NativeCurrency {
  equals(other: Currency): boolean {
    return other.isNative && other.chainId === this.chainId
  }

  get wrapped(): Token {
    if (!isMatic(this.chainId)) throw new Error('Not matic')
    const wrapped = WRAPPED_NATIVE_CURRENCY[this.chainId]
    invariant(wrapped instanceof Token)
    return wrapped
  }

  public constructor(chainId: number) {
    if (!isMatic(chainId)) throw new Error('Not matic')
    super(chainId, 18, 'MATIC', 'Polygon Matic')
  }
}

class ShibNativeCurrency extends NativeCurrency {
  equals(other: Currency): boolean {
    return other.isNative && other.chainId === this.chainId
  }

  get wrapped(): Token {
    const wrapped = WRAPPED_NATIVE_CURRENCY[this.chainId]
    invariant(wrapped instanceof Token)
    return wrapped
  }

  public constructor(chainId: number) {
    super(chainId, 18, 'WSHIB', 'Shib')
  }
}

export class ExtendedEther extends Ether {
  public get wrapped(): Token {
    const wrapped = WRAPPED_NATIVE_CURRENCY[this.chainId]
    if (wrapped) return wrapped
    throw new Error('Unsupported chain ID')
  }

  private static _cachedExtendedEther: { [chainId: number]: NativeCurrency } = {}

  public static onChain(chainId: number): ExtendedEther {
    return this._cachedExtendedEther[chainId] ?? (this._cachedExtendedEther[chainId] = new ExtendedEther(chainId))
  }
}

const cachedNativeCurrency: { [chainId: number]: NativeCurrency | Token } = {}
export function nativeOnChain(chainId: number): NativeCurrency | Token {
  if (cachedNativeCurrency[chainId]) return cachedNativeCurrency[chainId]
  let nativeCurrency: NativeCurrency | Token
  if (isMatic(chainId)) {
    nativeCurrency = new MaticNativeCurrency(chainId)
  } else if (chainId === SupportedChainId.SHIBCHAIN) {
    nativeCurrency = new ShibNativeCurrency(chainId)
  } else {
    nativeCurrency = ExtendedEther.onChain(chainId)
  }
  return (cachedNativeCurrency[chainId] = nativeCurrency)
}

export const TOKEN_SHORTHANDS: { [shorthand: string]: { [chainId in SupportedChainId]?: string } } = {
  USDC: {},
}
