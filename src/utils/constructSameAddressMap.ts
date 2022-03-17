import { L1_CHAIN_IDS, SupportedChainId } from '../constants/chains'

export function constructSameAddressMap<T extends string>(
  address: T,
  additionalNetworks: SupportedChainId[] = [],
  exceptNetworks: SupportedChainId[] = []
): { [chainId: number]: T } {
  return (L1_CHAIN_IDS as readonly SupportedChainId[])
    .concat(additionalNetworks)
    .filter((network) => !exceptNetworks.includes(network))
    .reduce<{ [chainId: number]: T }>((memo, chainId) => {
      memo[chainId] = address
      return memo
    }, {})
}
