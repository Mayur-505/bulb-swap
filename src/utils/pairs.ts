import { getCreate2Address } from '@ethersproject/address'
import { keccak256, pack } from '@ethersproject/solidity'
import { Token } from '@uniswap/sdk-core'
import { ROUTER_INFO } from 'constants/routers'

export const getPairAddress = (routerName: string, tokenA: Token, tokenB: Token): string => {
  const tokens = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA] // does safety checks

  return getCreate2Address(
    ROUTER_INFO[routerName].factoryAddress,
    keccak256(['bytes'], [pack(['address', 'address'], [tokens[0].address, tokens[1].address])]),
    ROUTER_INFO[routerName].initCodeHash
  )
}
