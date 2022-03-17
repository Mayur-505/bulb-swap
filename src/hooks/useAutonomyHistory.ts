import { defaultAbiCoder } from '@ethersproject/abi'
import { SupportedChainId } from 'constants/chains'
import { ROUTER_INFO } from 'constants/routers'
import Moralis from 'moralis'
import { useCallback, useEffect, useState } from 'react'
import { useRouterName } from 'state/application/hooks'

import { useActiveWeb3React } from './web3'

interface MoralisInfo {
  serverURL: string
  key: string
}

const MORALIS_INFO: { [chainId: number]: MoralisInfo } = {
  [SupportedChainId.BSC]: {
    serverURL: 'https://mz4k8ltjvwtm.usemoralis.com:2053/server',
    key: '0InOR7cWvu3rRwDZRHTDdDZ26Vj7Jc7HOBiYiGWa',
  },
  [SupportedChainId.AVAX]: {
    serverURL: 'https://ietd1r5r9bs1.usemoralis.com:2053/server',
    key: '94CRrkmYxPCfdDQQd4L9gGiem3PKpZsv25fTSwDO',
  },
}

export default function useTransactionHistory() {
  const [orders, setOrders] = useState<Array<any>>([])
  const [cancels, setCancels] = useState<Array<any>>([])
  const [executes, setExecuted] = useState<Array<any>>([])
  const { account, chainId = SupportedChainId.BSC } = useActiveWeb3React()
  const routerName = useRouterName()

  const BNB_TO_TOKEN_NO_PREPAY = '0xbc60b9aa'
  const BNB_TO_TOKEN_PREPAY = '0xf6992063'

  const TOKEN_TO_BNB_NO_PREPAY = '0xd2a9fb3e'
  const TOKEN_TO_BNB_PREPAY = '0xce6db3cc'

  const TOKEN_TO_TOKEN_NO_PREPAY = '0x35ae7b6e'
  const TOKEN_TO_TOKEN_PREPAY = '0x3b62609f'

  const REQUEST_LIMIT = 10000

  const canCancel = useCallback(
    (orderId: any) => {
      const cancelArr = cancels.map((cancel: any) => cancel.get('uid'))
      if (cancelArr.includes(orderId)) {
        return true
      }
      return false
    },
    [cancels]
  )

  const wasExecuted = useCallback(
    (orderId: any) => {
      const executedArr = executes.map((execute: any) => execute.get('uid'))
      if (executedArr.includes(orderId)) {
        return true
      }
      return false
    },
    [executes]
  )

  const parseOrders = useCallback(
    (allOrders: any[]) => {
      return allOrders
        .map((order: any) => ({
          method: methodSelector(order.get('callData')),
          callData: order.get('callData'),
          time: order.get('block_timestamp').toUTCString(),
          id: order.get('uid'),
          inputToken: findInputToken(order.get('callData')),
          outputToken: findOutPutToken(order.get('callData')),
          inputAmount: findInputAmount(order.get('callData'), order.get('ethForCall')),
          outputAmount: findOutputAmount(order.get('callData')),
          requester: order.get('user'),
          target: order.get('target'),
          referer: order.get('referer'),
          initEthSent: order.get('initEthSent'),
          ethForCall: order.get('ethForCall'),
          verifySender: order.get('verifyUser'),
          payWithAuto: order.get('payWithAUTO'),
          typeof: typeSelector(order.get('callData')),
          insertFeeAmount: order.get('insertFeeAmount'),
          status: canCancel(order.get('uid')) ? 'cancelled' : wasExecuted(order.get('uid')) ? 'executed' : 'open',
        }))
        .filter((order: any) => order.callData.includes(ROUTER_INFO[routerName].routerAddress.toLowerCase().substr(2)))
    },
    [canCancel, wasExecuted, chainId, routerName]
  )

  function methodSelector(orderData: any) {
    const sliced = orderData.slice(0, 10)
    if (sliced === BNB_TO_TOKEN_PREPAY || sliced === BNB_TO_TOKEN_NO_PREPAY) return 'BNB for Tokens'
    if (sliced === TOKEN_TO_BNB_PREPAY || sliced === TOKEN_TO_BNB_NO_PREPAY) return 'Tokens for BNB'
    if (sliced === TOKEN_TO_TOKEN_PREPAY || sliced === TOKEN_TO_TOKEN_NO_PREPAY) return 'Tokens for Tokens'
    return 'Undefined Method'
  }

  function typeSelector(orderData: any) {
    const sliced = orderData.slice(0, 10)
    const actualData = `0x${orderData.slice(10, orderData.length + 1)}`
    let decoded: any

    if (sliced === BNB_TO_TOKEN_PREPAY) {
      decoded = defaultAbiCoder.decode(
        ['uint256', 'address', 'uint256', 'uint256', ' address[]', 'address', 'uint256'],
        actualData
      )
      if (decoded[2].toString() === '0') {
        return 'Stop'
      } else {
        return 'Limit'
      }
    }
    if (sliced === BNB_TO_TOKEN_NO_PREPAY) {
      decoded = defaultAbiCoder.decode(
        ['address', 'uint256', 'uint256', 'address', 'uint256', 'uint256', 'address[]', 'uint256'],
        actualData
      )
      if (decoded[4].toString() === '0') {
        return 'Stop'
      } else {
        return 'Limit'
      }
    }
    if (sliced === BNB_TO_TOKEN_PREPAY) {
      decoded = defaultAbiCoder.decode(
        ['uint256', 'address', 'uint256', 'uint256', ' address[]', 'address', 'uint256'],
        actualData
      )
      if (decoded[2].toString() === '0') {
        return 'Stop'
      } else {
        return 'Limit'
      }
    }
    if (sliced === TOKEN_TO_BNB_NO_PREPAY) {
      decoded = defaultAbiCoder.decode(
        ['address', 'uint256', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'address[]', 'uint256'],
        actualData
      )
      if (decoded[5].toString() === '0') {
        return 'Stop'
      } else {
        return 'Limit'
      }
    }
    if (sliced === TOKEN_TO_BNB_PREPAY) {
      decoded = defaultAbiCoder.decode(
        ['address', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'address[]', 'address', 'uint256'],
        actualData
      )
      if (decoded[4].toString() === '0') {
        return 'Stop'
      } else {
        return 'Limit'
      }
    }
    if (sliced === TOKEN_TO_TOKEN_NO_PREPAY) {
      decoded = defaultAbiCoder.decode(
        ['address', 'uint256', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'address[]', 'uint256'],
        actualData
      )
      if (decoded[5].toString() === '0') {
        return 'Stop'
      } else {
        return 'Limit'
      }
    }
    if (sliced === TOKEN_TO_TOKEN_PREPAY) {
      decoded = defaultAbiCoder.decode(
        ['address', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'address[]', 'address', 'uint256'],
        actualData
      )
      if (decoded[4].toString() === '0') {
        return 'Stop'
      } else {
        return 'Limit'
      }
    }
    return 'Undefined'
  }

  function findOutputAmount(callData: any) {
    const sliced = callData.slice(0, 10)
    const actualData = `0x${callData.slice(10, callData.length + 1)}`
    let decoded: any
    let outputAmount = ''
    if (sliced === BNB_TO_TOKEN_NO_PREPAY) {
      decoded = defaultAbiCoder.decode(
        ['address', 'uint256', 'uint256', 'address', 'uint256', 'uint256', 'address[]', 'uint256'],
        actualData
      )
      if (decoded[4].toString() === '0') {
        outputAmount = decoded[5].toString()
      } else {
        outputAmount = decoded[4].toString()
      }
    } else if (sliced === BNB_TO_TOKEN_PREPAY) {
      decoded = defaultAbiCoder.decode(
        ['uint256', 'address', 'uint256', 'uint256', ' address[]', 'address', 'uint256'],
        actualData
      )
      if (decoded[2].toString() === '0') {
        outputAmount = decoded[3].toString()
      } else {
        outputAmount = decoded[2].toString()
      }
    } else if (sliced === TOKEN_TO_BNB_NO_PREPAY) {
      decoded = defaultAbiCoder.decode(
        ['address', 'uint256', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'address[]', 'uint256'],
        actualData
      )
      if (decoded[5].toString() === '0') {
        outputAmount = decoded[6].toString()
      } else {
        outputAmount = decoded[5].toString()
      }
    } else if (sliced === TOKEN_TO_BNB_PREPAY) {
      decoded = defaultAbiCoder.decode(
        ['address', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'address[]', 'address', 'uint256'],
        actualData
      )
      if (decoded[4].toString() === '0') {
        outputAmount = decoded[5].toString()
      } else {
        outputAmount = decoded[4].toString()
      }
    } else if (sliced === TOKEN_TO_TOKEN_NO_PREPAY) {
      decoded = defaultAbiCoder.decode(
        ['address', 'uint256', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'address[]', 'uint256'],
        actualData
      )
      if (decoded[5].toString() === '0') {
        outputAmount = decoded[6].toString()
      } else {
        outputAmount = decoded[5].toString()
      }
    } else if (sliced === TOKEN_TO_TOKEN_PREPAY) {
      decoded = defaultAbiCoder.decode(
        ['address', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'address[]', 'address', 'uint256'],
        actualData
      )
      if (decoded[4].toString() === '0') {
        outputAmount = decoded[5].toString()
      } else {
        outputAmount = decoded[4].toString()
      }
    }
    return outputAmount
  }

  function findInputAmount(callData: any, ethForCall: any) {
    const sliced = callData.slice(0, 10)
    const actualData = `0x${callData.slice(10, callData.length + 1)}`
    let decoded: any
    let inputAmount = ''
    if (sliced === BNB_TO_TOKEN_NO_PREPAY) {
      inputAmount = ethForCall
    } else if (sliced === BNB_TO_TOKEN_PREPAY) {
      decoded = defaultAbiCoder.decode(
        ['uint256', 'address', 'uint256', 'uint256', ' address[]', 'address', 'uint256'],
        actualData
      )
      inputAmount = ethForCall
    } else if (sliced === TOKEN_TO_BNB_NO_PREPAY) {
      decoded = defaultAbiCoder.decode(
        ['address', 'uint256', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'address[]', 'uint256'],
        actualData
      )
      inputAmount = decoded[4].toString()
    } else if (sliced === TOKEN_TO_BNB_PREPAY) {
      decoded = defaultAbiCoder.decode(
        ['address', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'address[]', 'address', 'uint256'],
        actualData
      )
      inputAmount = decoded[3].toString()
    } else if (sliced === TOKEN_TO_TOKEN_NO_PREPAY) {
      decoded = defaultAbiCoder.decode(
        ['address', 'uint256', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'address[]', 'uint256'],
        actualData
      )
      inputAmount = decoded[4].toString()
    } else if (sliced === TOKEN_TO_TOKEN_PREPAY) {
      decoded = defaultAbiCoder.decode(
        ['address', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'address[]', 'address', 'uint256'],
        actualData
      )
      inputAmount = decoded[3].toString()
    }
    return inputAmount
  }

  function findOutPutToken(callData: any) {
    const sliced = callData.slice(0, 10)
    const actualData = `0x${callData.slice(10, callData.length + 1)}`
    let decoded: any
    let outputToken = ''
    if (sliced === BNB_TO_TOKEN_NO_PREPAY) {
      decoded = defaultAbiCoder.decode(
        ['address', 'uint256', 'uint256', 'address', 'uint256', 'uint256', 'address[]', 'uint256'],
        actualData
      )
      outputToken = decoded[6][decoded[6].length - 1]
    } else if (sliced === BNB_TO_TOKEN_PREPAY) {
      decoded = defaultAbiCoder.decode(
        ['uint256', 'address', 'uint256', 'uint256', ' address[]', 'address', 'uint256'],
        actualData
      )
      outputToken = decoded[4][decoded[4].length - 1]
    } else if (sliced === TOKEN_TO_BNB_NO_PREPAY) {
      decoded = defaultAbiCoder.decode(
        ['address', 'uint256', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'address[]', 'uint256'],
        actualData
      )
      outputToken = decoded[7][decoded[7].length - 1]
    } else if (sliced === TOKEN_TO_BNB_PREPAY) {
      decoded = defaultAbiCoder.decode(
        ['address', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'address[]', 'address', 'uint256'],
        actualData
      )
      outputToken = decoded[6][decoded[6].length - 1]
    } else if (sliced === TOKEN_TO_TOKEN_NO_PREPAY) {
      decoded = defaultAbiCoder.decode(
        ['address', 'uint256', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'address[]', 'uint256'],
        actualData
      )
      outputToken = decoded[7][decoded[7].length - 1]
    } else if (sliced === TOKEN_TO_TOKEN_PREPAY) {
      decoded = defaultAbiCoder.decode(
        ['address', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'address[]', 'address', 'uint256'],
        actualData
      )
      outputToken = decoded[6][decoded[6].length - 1]
    }
    return outputToken
  }

  function findInputToken(callData: any) {
    const sliced = callData.slice(0, 10)
    const actualData = `0x${callData.slice(10, callData.length + 1)}`
    let decoded: any
    let inputToken = ''
    if (sliced === BNB_TO_TOKEN_NO_PREPAY) {
      decoded = defaultAbiCoder.decode(
        ['address', 'uint256', 'uint256', 'address', 'uint256', 'uint256', 'address[]', 'uint256'],
        actualData
      )
      inputToken = decoded[6][0]
    } else if (sliced === BNB_TO_TOKEN_PREPAY) {
      decoded = defaultAbiCoder.decode(
        ['uint256', 'address', 'uint256', 'uint256', ' address[]', 'address', 'uint256'],
        actualData
      )
      inputToken = decoded[4][0]
    } else if (sliced === TOKEN_TO_BNB_NO_PREPAY) {
      decoded = defaultAbiCoder.decode(
        ['address', 'uint256', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'address[]', 'uint256'],
        actualData
      )
      inputToken = decoded[7][0]
    } else if (sliced === TOKEN_TO_BNB_PREPAY) {
      decoded = defaultAbiCoder.decode(
        ['address', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'address[]', 'address', 'uint256'],
        actualData
      )
      inputToken = decoded[6][0]
    } else if (sliced === TOKEN_TO_TOKEN_NO_PREPAY) {
      decoded = defaultAbiCoder.decode(
        ['address', 'uint256', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'address[]', 'uint256'],
        actualData
      )
      inputToken = decoded[7][0]
    } else if (sliced === TOKEN_TO_TOKEN_PREPAY) {
      decoded = defaultAbiCoder.decode(
        ['address', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'address[]', 'address', 'uint256'],
        actualData
      )
      inputToken = decoded[6][0]
    }
    return inputToken
  }

  useEffect(() => {
    Moralis.initialize(MORALIS_INFO[chainId].key)
    Moralis.serverURL = MORALIS_INFO[chainId].serverURL
    async function init() {
      const bscTarget = new Moralis.Query('RegistryRequests')
      bscTarget.equalTo('target', '0xb231b2c7bea4f767951e79dd5f4973bc1addb189')
      const avaxTarget = new Moralis.Query('RegistryRequests')
      avaxTarget.equalTo('target', '0xe3e761127cbd037e18186698a2733d1e71623ebe')
      const queryRequests = Moralis.Query.or(bscTarget, avaxTarget)
      const queryCancels = new Moralis.Query('RegistryCancelRequests')
      const queryExecutes = new Moralis.Query('RegistryExecutedRequests')
      queryRequests.equalTo('user', account?.toLocaleLowerCase())
      queryRequests.limit(REQUEST_LIMIT)
      queryCancels.limit(REQUEST_LIMIT)
      queryExecutes.limit(REQUEST_LIMIT)
      const registryRequests = await queryRequests.find()
      const registryCancelRequests = await queryCancels.find()
      const registryExecutedRequests = await queryExecutes.find()
      setOrders(registryRequests)
      setCancels(registryCancelRequests)
      setExecuted(registryExecutedRequests)
    }

    const interval = setInterval(init, 4000)
    return () => clearInterval(interval)
  }, [setOrders, setCancels, account, chainId])

  return [parseOrders(orders)]
}
