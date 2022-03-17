import { SupportedChainId } from 'constants/chains'
import { SupportedRouter } from 'constants/routers'

export function supportedRouterName(chainId: number): string | null {
  if (chainId === SupportedChainId.BSC) {
    return SupportedRouter.APESWAP
  }
  if (chainId === SupportedChainId.AVAX) {
    return SupportedRouter.TRADERJOE
  }
  return ''
}
