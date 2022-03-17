import apeSwapLogoUrl from 'assets/images/apeswap.svg'
import pancakeSwapLogoUrl from 'assets/images/pancakeswap.svg'
import traderJoeLogoUrl from 'assets/images/traderjoe.png'

import { SupportedChainId } from './chains'

export enum SupportedRouter {
  APESWAP = 'apeswap',
  PANCAKESWAP = 'pancakeswap',
  TRADERJOE = 'traderjoe',
}

export interface RouterInfo {
  readonly label: string
  readonly logoUrl?: string
  readonly tokenListUrl: string
  readonly routerAddress: string
  readonly factoryAddress: string
  readonly initCodeHash: string
  readonly chainId: number
}

export const ROUTER_INFO: { [routerName: string]: RouterInfo } = {
  [SupportedRouter.APESWAP]: {
    label: 'ApeSwap',
    logoUrl: apeSwapLogoUrl,
    tokenListUrl: 'https://raw.githubusercontent.com/ApeSwapFinance/apeswap-token-lists/main/lists/apeswap.json',
    routerAddress: '0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7',
    factoryAddress: '0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6',
    initCodeHash: '0xf4ccce374816856d11f00e4069e7cada164065686fbef53c6167a63ec2fd8c5b',
    chainId: SupportedChainId.BSC,
  },
  [SupportedRouter.PANCAKESWAP]: {
    label: 'PancakeSwap',
    logoUrl: pancakeSwapLogoUrl,
    tokenListUrl: 'https://tokens.pancakeswap.finance/pancakeswap-extended.json',
    routerAddress: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    factoryAddress: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
    initCodeHash: '0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5',
    chainId: SupportedChainId.BSC,
  },
  [SupportedRouter.TRADERJOE]: {
    label: 'TraderJoe',
    logoUrl: traderJoeLogoUrl,
    tokenListUrl: 'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/joe.tokenlist.json',
    routerAddress: '0x60aE616a2155Ee3d9A68541Ba4544862310933d4',
    factoryAddress: '0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10',
    initCodeHash: '0x0bbca9af0511ad1a1da383135cf3a8d2ac620e549ef9f6ae3a4c33c2fed0af91',
    chainId: SupportedChainId.AVAX,
  },
}
