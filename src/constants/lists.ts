import { SupportedChainId } from 'constants/chains'

import { ROUTER_INFO, SupportedRouter } from './routers'

export const UNSUPPORTED_LIST_URLS: string[] = []

// this is the default list of lists that are exposed to users
// lower index == higher priority for token import
const DEFAULT_LIST_OF_LISTS_TO_DISPLAY: { [chainId: number]: string[] } = {
  [SupportedChainId.BSC]: [
    ROUTER_INFO[SupportedRouter.APESWAP].tokenListUrl,
    ROUTER_INFO[SupportedRouter.PANCAKESWAP].tokenListUrl,
  ],
  [SupportedChainId.AVAX]: [ROUTER_INFO[SupportedRouter.TRADERJOE].tokenListUrl],
}

export const DEFAULT_LIST_OF_LISTS: { [chainId: number]: string[] } = {
  [SupportedChainId.BSC]: [
    ...DEFAULT_LIST_OF_LISTS_TO_DISPLAY[SupportedChainId.BSC],
    ...UNSUPPORTED_LIST_URLS, // need to load dynamic unsupported tokens as well
  ],
  [SupportedChainId.AVAX]: [
    ...DEFAULT_LIST_OF_LISTS_TO_DISPLAY[SupportedChainId.AVAX],
    ...UNSUPPORTED_LIST_URLS, // need to load dynamic unsupported tokens as well
  ],
}

// default lists to be 'active' aka searched across
export const DEFAULT_ACTIVE_LIST_URLS: { [chainId: number]: string[] } = {
  [SupportedChainId.BSC]: [ROUTER_INFO[SupportedRouter.APESWAP].tokenListUrl],
  [SupportedChainId.AVAX]: [ROUTER_INFO[SupportedRouter.TRADERJOE].tokenListUrl],
}
