import { isAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
// eslint-disable-next-line no-restricted-imports
import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Percent, TradeType, validateAndParseAddress } from '@uniswap/sdk-core'
import { Router, SwapParameters, Trade as V2Trade, TradeOptions, TradeOptionsDeadline } from '@uniswap/v2-sdk'
import { Trade as V3Trade } from '@uniswap/v3-sdk'
import { TRASNFER_FEE_TOKEN_ADDRESS_LIST } from 'constants/autonomy'
import { SupportedChainId } from 'constants/chains'
import { WETH9_EXTENDED } from 'constants/tokens'
import { parseEther, parseUnits } from 'ethers/lib/utils'
import { ReactNode, useMemo } from 'react'
import { TransactionType } from 'state/transactions/actions'
import { shortenAddress } from 'utils'

import { SWAP_ROUTER_ADDRESSES } from '../constants/addresses'
import { useTransactionAdder } from '../state/transactions/hooks'
import { useAutonomyPaymentManager } from '../state/user/hooks'
import { calculateGasMargin } from '../utils/calculateGasMargin'
import isZero from '../utils/isZero'
import { useMidRouterContract, useRegistryContract, useV2RouterContract } from './useContract'
import useENS from './useENS'
import { SignatureData } from './useERC20Permit'
import useGasPrice from './useGasPrice'
import { useActiveWeb3React } from './web3'

enum SwapCallbackState {
  INVALID,
  LOADING,
  VALID,
}

interface SwapCall {
  contract: Contract
  parameters: {
    methodName: string
    args: any[]
    value: string
  }
}

interface SwapCallEstimate {
  call: SwapCall
}

interface SuccessfulCall extends SwapCallEstimate {
  call: SwapCall
  gasEstimate: BigNumber
}

interface FailedCall extends SwapCallEstimate {
  call: SwapCall
  error: Error
}

type EstimatedSwapCall = SuccessfulCall | FailedCall

/**
 * This is hacking out the revert reason from the ethers provider thrown error however it can.
 * This object seems to be undocumented by ethers.
 * @param error an error from the ethers provider
 */
function swapErrorToUserReadableMessage(error: any): ReactNode {
  let reason: string | undefined
  while (Boolean(error)) {
    reason = error.reason ?? error.message ?? reason
    error = error.error ?? error.data?.originalError
  }

  if (reason?.indexOf('execution reverted: ') === 0) reason = reason.substr('execution reverted: '.length)

  switch (reason) {
    case 'UniswapV2Router: EXPIRED':
      return (
        <Trans>
          The transaction could not be sent because the deadline has passed. Please check that your transaction deadline
          is not too low.
        </Trans>
      )
    case 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT':
    case 'UniswapV2Router: EXCESSIVE_INPUT_AMOUNT':
      return (
        <Trans>
          This transaction will not succeed either due to price movement or fee on transfer. Try increasing your
          slippage tolerance.
        </Trans>
      )
    case 'TransferHelper: TRANSFER_FROM_FAILED':
      return <Trans>The input token cannot be transferred. There may be an issue with the input token.</Trans>
    case 'UniswapV2: TRANSFER_FAILED':
      return <Trans>The output token cannot be transferred. There may be an issue with the output token.</Trans>
    case 'UniswapV2: K':
      return (
        <Trans>
          The Uniswap invariant x*y=k was not satisfied by the swap. This usually means one of the tokens you are
          swapping incorporates custom behavior on transfer.
        </Trans>
      )
    case 'Too little received':
    case 'Too much requested':
    case 'STF':
      return (
        <Trans>
          This transaction will not succeed due to price movement. Try increasing your slippage tolerance. Note: fee on
          transfer and rebase tokens are incompatible with Uniswap V3.
        </Trans>
      )
    case 'TF':
      return (
        <Trans>
          The output token cannot be transferred. There may be an issue with the output token. Note: fee on transfer and
          rebase tokens are incompatible with Uniswap V3.
        </Trans>
      )
    default:
      if (reason?.indexOf('undefined is not an object') !== -1) {
        console.error(error, reason)
        return (
          <Trans>
            An error occurred when trying to execute this swap. You may need to increase your slippage tolerance. If
            that does not work, there may be an incompatibility with the token you are trading. Note: fee on transfer
            and rebase tokens are incompatible with Uniswap V3.
          </Trans>
        )
      }
      return (
        <Trans>
          Unknown error{reason ? `: "${reason}"` : ''}. Try increasing your slippage tolerance. Note: fee on transfer
          and rebase tokens are incompatible with Uniswap V3.
        </Trans>
      )
  }
}

function toHex(currencyAmount: CurrencyAmount<Currency>) {
  return `0x${currencyAmount.quotient.toString(16)}`
}

function joeSwapCallArguments(
  trade: V2Trade<Currency, Currency, TradeType>,
  options: TradeOptions | TradeOptionsDeadline
): SwapParameters {
  const etherIn = trade.inputAmount.currency.isNative
  const etherOut = trade.outputAmount.currency.isNative

  const to: string = validateAndParseAddress(options.recipient)
  const amountIn: string = toHex(trade.maximumAmountIn(options.allowedSlippage))
  const amountOut: string = toHex(trade.minimumAmountOut(options.allowedSlippage))
  const path: string[] = trade.route.path.map((token) => token.address)
  const deadline =
    'ttl' in options
      ? `0x${(Math.floor(new Date().getTime() / 1000) + options.ttl).toString(16)}`
      : `0x${options.deadline.toString(16)}`

  const useFeeOnTransfer = Boolean(options.feeOnTransfer)

  let methodName: string
  let args: (string | string[])[]
  let value: string
  switch (trade.tradeType) {
    case TradeType.EXACT_INPUT:
      if (etherIn) {
        methodName = useFeeOnTransfer ? 'swapExactAVAXForTokensSupportingFeeOnTransferTokens' : 'swapExactAVAXForTokens'
        // (uint amountOutMin, address[] calldata path, address to, uint deadline)
        args = [amountOut, path, to, deadline]
        value = amountIn
      } else if (etherOut) {
        methodName = useFeeOnTransfer ? 'swapExactTokensForAVAXSupportingFeeOnTransferTokens' : 'swapExactTokensForAVAX'
        // (uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
        args = [amountIn, amountOut, path, to, deadline]
        value = '0x0'
      } else {
        methodName = useFeeOnTransfer
          ? 'swapExactTokensForTokensSupportingFeeOnTransferTokens'
          : 'swapExactTokensForTokens'
        // (uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
        args = [amountIn, amountOut, path, to, deadline]
        value = '0x0'
      }
      break
    case TradeType.EXACT_OUTPUT:
      if (etherIn) {
        methodName = 'swapAVAXForExactTokens'
        // (uint amountOut, address[] calldata path, address to, uint deadline)
        args = [amountOut, path, to, deadline]
        value = amountIn
      } else if (etherOut) {
        methodName = 'swapTokensForExactAVAX'
        // (uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
        args = [amountOut, amountIn, path, to, deadline]
        value = '0x0'
      } else {
        methodName = 'swapTokensForExactTokens'
        // (uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
        args = [amountOut, amountIn, path, to, deadline]
        value = '0x0'
      }
      break
  }
  return {
    methodName,
    args,
    value,
  }
}

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param recipientAddressOrName the ENS name or address of the recipient of the swap output
 * @param signatureData the signature data of the permit of the input token amount, if available
 */
function useSwapCallArguments(
  trade: V2Trade<Currency, Currency, TradeType> | V3Trade<Currency, Currency, TradeType> | undefined, // trade to execute, required
  allowedSlippage: Percent, // in bips
  recipientAddressOrName: string | null, // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
  signatureData: SignatureData | undefined | null
): SwapCall[] {
  const { account, chainId, library } = useActiveWeb3React()
  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress
  const deadline = new Date('2050-01-01').valueOf() / 1000
  const routerContract = useV2RouterContract()

  return useMemo(() => {
    if (!trade || !recipient || !library || !account || !chainId) return []

    if (trade instanceof V2Trade) {
      if (!routerContract) return []
      const swapMethods = []
      const tradeOptions = {
        feeOnTransfer: false,
        allowedSlippage,
        recipient,
        deadline,
      }

      swapMethods.push(
        chainId === SupportedChainId.BSC
          ? Router.swapCallParameters(trade, tradeOptions)
          : joeSwapCallArguments(trade, tradeOptions)
      )

      if (trade.tradeType === TradeType.EXACT_INPUT) {
        const tradeOptions = {
          feeOnTransfer: true,
          allowedSlippage,
          recipient,
          deadline,
        }
        swapMethods.push(
          chainId === SupportedChainId.BSC
            ? Router.swapCallParameters(trade, tradeOptions)
            : joeSwapCallArguments(trade, tradeOptions)
        )
      }
      return swapMethods.map((parameters) => ({ parameters, contract: routerContract }))
    } else {
      // trade is V3Trade
      const swapRouterAddress = chainId ? SWAP_ROUTER_ADDRESSES[chainId] : undefined
      if (!swapRouterAddress) return []

      return []
    }
  }, [account, allowedSlippage, chainId, deadline, library, recipient, routerContract, trade])
}

export function useSwapCallback(
  trade: V2Trade<Currency, Currency, TradeType> | V3Trade<Currency, Currency, TradeType> | undefined, // trade to execute, required
  allowedSlippage: Percent, // in bips
  recipientAddressOrName: string | null, // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
  signatureData: SignatureData | undefined | null
): { state: SwapCallbackState; callback: null | (() => Promise<string>); error: ReactNode | null } {
  const { account, chainId, library } = useActiveWeb3React()
  const gasPrice = useGasPrice()

  const swapCalls = useSwapCallArguments(trade, allowedSlippage, recipientAddressOrName, signatureData)

  const addTransaction = useTransactionAdder()

  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress

  return useMemo(() => {
    if (!trade || !library || !account || !chainId) {
      return { state: SwapCallbackState.INVALID, callback: null, error: <Trans>Missing dependencies</Trans> }
    }
    if (!recipient) {
      if (recipientAddressOrName !== null) {
        return { state: SwapCallbackState.INVALID, callback: null, error: <Trans>Invalid recipient</Trans> }
      } else {
        return { state: SwapCallbackState.LOADING, callback: null, error: null }
      }
    }

    return {
      state: SwapCallbackState.VALID,
      callback: async function onSwap(): Promise<string> {
        const estimatedCalls: SwapCallEstimate[] = await Promise.all(
          swapCalls.map((call) => {
            const {
              parameters: { methodName, args, value },
              contract,
            } = call

            const options = !value || isZero(value) ? {} : { value }

            return contract.estimateGas[methodName](...args, options)
              .then((gasEstimate) => {
                return {
                  call,
                  gasEstimate,
                }
              })
              .catch((gasError) => {
                console.debug('Gas estimate failed, trying eth_call to extract error', call)

                return contract.callStatic[methodName](...args, options)
                  .then((result) => {
                    console.debug('Unexpected successful call after failed estimate gas', call, gasError, result)
                    return { call, error: <Trans>Unexpected issue with estimating the gas. Please try again.</Trans> }
                  })
                  .catch((callError) => {
                    console.debug('Call threw error', call, callError)
                    return { call, error: swapErrorToUserReadableMessage(callError) }
                  })
              })
          })
        )

        // a successful estimation is a bignumber gas estimate and the next call is also a bignumber gas estimate
        const bestCallOption: SuccessfulCall | undefined = estimatedCalls.find(
          (el, ix, list): el is SuccessfulCall =>
            'gasEstimate' in el && (ix === list.length - 1 || 'gasEstimate' in list[ix + 1])
        )

        // check if any calls errored with a recognizable error
        if (!bestCallOption) {
          const errorCalls = estimatedCalls.filter((call): call is FailedCall => 'error' in call)
          if (errorCalls.length > 0) throw errorCalls[errorCalls.length - 1].error
          throw new Error('Unexpected error. Could not estimate gas for the swap.')
        }

        const {
          call: {
            contract,
            parameters: { methodName, args, value },
          },
          gasEstimate,
        } = bestCallOption

        return contract[methodName](...args, {
          gasLimit: calculateGasMargin(gasEstimate),
          gasPrice,
          ...(value && !isZero(value) ? { value, from: account } : { from: account }),
        })
          .then((response: any) => {
            addTransaction(
              response,
              trade.tradeType === TradeType.EXACT_INPUT
                ? {
                    type: TransactionType.SWAP,
                    tradeType: TradeType.EXACT_INPUT,
                    inputCurrencyId: trade.inputAmount.currency.symbol || '',
                    inputCurrencyAmountRaw: trade.inputAmount.quotient.toString(),
                    expectedOutputCurrencyAmountRaw: trade.outputAmount.quotient.toString(),
                    outputCurrencyId: trade.outputAmount.currency.symbol || '',
                    minimumOutputCurrencyAmountRaw: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
                  }
                : {
                    type: TransactionType.SWAP,
                    tradeType: TradeType.EXACT_OUTPUT,
                    inputCurrencyId: trade.inputAmount.currency.symbol || '',
                    maximumInputCurrencyAmountRaw: trade.maximumAmountIn(allowedSlippage).quotient.toString(),
                    outputCurrencyId: trade.outputAmount.currency.symbol || '',
                    outputCurrencyAmountRaw: trade.outputAmount.quotient.toString(),
                    expectedInputCurrencyAmountRaw: trade.inputAmount.quotient.toString(),
                  }
            )

            return response.hash
          })
          .catch((error: any) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error('Transaction rejected.')
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error('Swap failed', error, methodName, args, value)
              throw new Error(`Swap failed: ${swapErrorToUserReadableMessage(error)}`)
            }
          })
      },
      error: null,
    }
  }, [
    trade,
    library,
    account,
    chainId,
    recipient,
    recipientAddressOrName,
    swapCalls,
    addTransaction,
    allowedSlippage,
    gasPrice,
  ])
}

export function useAutoSwapCallArguments(
  trade: V2Trade<Currency, Currency, TradeType> | V3Trade<Currency, Currency, TradeType> | undefined, // trade to execute, required
  allowedSlippage: Percent, // in bips
  recipientAddressOrName: string | null,
  signatureData: SignatureData | undefined | null,
  tradeLimitType: string | undefined,
  outputMinMaxAmount: string | undefined
): SwapCall[] {
  const { account } = useActiveWeb3React()
  const midRouterContract = useMidRouterContract()
  const registryContract = useRegistryContract()
  const [autonomyPrepay] = useAutonomyPaymentManager()

  const swapCalls: SwapCall[] = useSwapCallArguments(trade, allowedSlippage, recipientAddressOrName, signatureData)

  return useMemo(() => {
    const inputCurrencyDecimals = trade?.inputAmount.currency.decimals || 18
    const outputCurrencyDecimals = trade?.outputAmount.currency.decimals || 18
    let inputAmount: BigNumber | undefined
    let outputAmount: BigNumber | undefined

    try {
      inputAmount = trade?.inputAmount
        ? parseEther(trade?.inputAmount.toSignificant(6)).div(10 ** (18 - inputCurrencyDecimals))
        : undefined
      outputAmount = outputMinMaxAmount
        ? parseEther(outputMinMaxAmount).div(10 ** (18 - outputCurrencyDecimals))
        : undefined
    } catch (e) {
      // For math errors with too tiny holding values
      inputAmount = undefined
      outputAmount = undefined
    }
    if (!trade || !midRouterContract || !registryContract || !tradeLimitType || !inputAmount || !outputAmount)
      return swapCalls
    return swapCalls.map(({ parameters: { methodName, args, value }, contract }) => {
      const params = [contract.address, ...args]
      let calldata = '0x0'
      let ethForCall = '0x0'
      let swapMethod
      let swapArgs
      let verifySender = true
      let insertFeeAmount = false
      switch (methodName) {
        case 'swapExactETHForTokens':
        case 'swapETHForExactTokens':
        case 'swapExactETHForTokensSupportingFeeOnTransferTokens':
        case 'swapExactAVAXForTokens':
        case 'swapAVAXForExactTokens':
        case 'swapExactAVAXForTokensSupportingFeeOnTransferTokens':
          swapMethod = tradeLimitType === 'limit-order' ? 'ethToTokenRange' : 'ethToTokenRange'
          swapArgs = [
            BigNumber.from('9999999999999999'),
            params[0],
            outputAmount,
            BigNumber.from('115792089237316195423570985008687907853269984665640564039457584007913129639935'), //this is solidity max uint
            params[2],
            params[3],
            params[4],
          ]
          if (!autonomyPrepay) {
            swapMethod = `${swapMethod}PayDefault`
            swapArgs = [
              params[3],
              '0x0',
              BigNumber.from('9999999999999999'),
              params[0],
              outputAmount,
              BigNumber.from('115792089237316195423570985008687907853269984665640564039457584007913129639935').div(
                BigNumber.from(10).mul(BigNumber.from(inputAmount))
              ), //this is solidity max uint
              params[2],
              params[4],
            ]
            insertFeeAmount = true
          } else {
            verifySender = false
          }
          if (tradeLimitType === 'stop-loss') {
            if (!autonomyPrepay) {
              swapArgs = [
                params[3],
                '0x0',
                BigNumber.from('9999999999999999'),
                params[0],
                BigNumber.from('0'),
                outputAmount,
                params[2],
                params[4],
              ]
            } else {
              swapArgs = [
                BigNumber.from('9999999999999999'),
                params[0],
                BigNumber.from('0'),
                outputAmount,
                params[2],
                params[3],
                params[4],
              ]
            }
          }
          calldata = midRouterContract.interface.encodeFunctionData(swapMethod, swapArgs)
          ethForCall = value
          break
        case 'swapExactTokensForETH':
        case 'swapTokensForExactETH':
        case 'swapExactTokensForETHSupportingFeeOnTransferTokens':
        case 'swapExactTokensForAVAX':
        case 'swapTokensForExactAVAX':
        case 'swapExactTokensForAVAXSupportingFeeOnTransferTokens':
          swapMethod = tradeLimitType === 'limit-order' ? 'tokenToEthRange' : 'tokenToEthRange'
          swapArgs = [
            account,
            BigNumber.from('9999999999999999'),
            params[0],
            inputAmount,
            outputAmount,
            BigNumber.from('115792089237316195423570985008687907853269984665640564039457584007913129639935'), //this is solidity max uint
            params[3],
            params[4],
            params[5],
          ]
          if (!autonomyPrepay) {
            swapMethod = `${swapMethod}PayDefault`
            swapArgs = [
              account,
              '0x0',
              BigNumber.from('9999999999999999'),
              params[0],
              inputAmount,
              outputAmount,
              BigNumber.from('115792089237316195423570985008687907853269984665640564039457584007913129639935').div(
                BigNumber.from(10).mul(BigNumber.from(inputAmount))
              ), //this is solidity max uint
              params[3],
              params[5],
            ]
            insertFeeAmount = true
          }
          if (tradeLimitType === 'stop-loss') {
            if (!autonomyPrepay) {
              swapArgs = [
                account,
                '0x0',
                BigNumber.from('9999999999999999'),
                params[0],
                inputAmount,
                BigNumber.from('0'),
                outputAmount,
                params[3],
                params[5],
              ]
            } else {
              swapArgs = [
                account,
                BigNumber.from('9999999999999999'),
                params[0],
                inputAmount,
                BigNumber.from('0'),
                outputAmount,
                params[3],
                params[4],
                params[5],
              ]
            }
          }
          calldata = midRouterContract.interface.encodeFunctionData(swapMethod, swapArgs)
          break
        case 'swapExactTokensForTokens':
        case 'swapTokensForExactTokens':
        case 'swapExactTokensForTokensSupportingFeeOnTransferTokens':
          swapMethod = tradeLimitType === 'limit-order' ? 'tokenToTokenRange' : 'tokenToTokenRange'
          swapArgs = [
            account,
            BigNumber.from('9999999999999999'),
            params[0],
            inputAmount,
            outputAmount,
            BigNumber.from('115792089237316195423570985008687907853269984665640564039457584007913129639935'), //this is solidity max uint
            params[3],
            params[4],
            params[5],
          ]
          if (!autonomyPrepay) {
            swapMethod = `${swapMethod}PayDefault`
            swapArgs = [
              account,
              '0x0',
              BigNumber.from('9999999999999999'),
              params[0],
              inputAmount,
              outputAmount,
              BigNumber.from('115792089237316195423570985008687907853269984665640564039457584007913129639935').div(
                BigNumber.from(10).mul(BigNumber.from(inputAmount))
              ),
              params[3],
              params[5],
            ]
            insertFeeAmount = true
          }
          if (tradeLimitType === 'stop-loss') {
            if (!autonomyPrepay) {
              swapArgs = [
                account,
                '0x0',
                BigNumber.from('9999999999999999'),
                params[0],
                inputAmount,
                BigNumber.from('0'),
                outputAmount,
                params[3],
                params[5],
              ]
            } else {
              swapArgs = [
                account,
                BigNumber.from('9999999999999999'),
                params[0],
                inputAmount,
                BigNumber.from('0'),
                outputAmount,
                params[3],
                params[4],
                params[5],
              ]
            }
          }
          calldata = midRouterContract.interface.encodeFunctionData(swapMethod, swapArgs)
          break
      }
      const wrapperArgs = [
        midRouterContract.address,
        '0x0000000000000000000000000000000000000001',
        calldata,
        BigNumber.from(ethForCall),
        verifySender,
        insertFeeAmount,
        false,
      ]
      // const wrapperCalldata = registryContract.interface.encodeFunctionData('newReq', wrapperArgs)
      // Cap original value with autonomy fee - 0.01 ether
      const wrapperValue = autonomyPrepay
        ? BigNumber.from(value).add(parseEther('0.01')).toHexString()
        : BigNumber.from(value).toHexString()

      return {
        parameters: { methodName: 'newReq', args: wrapperArgs, value: wrapperValue },
        contract: registryContract,
      }
    })
  }, [
    swapCalls,
    midRouterContract,
    registryContract,
    account,
    outputMinMaxAmount,
    trade,
    tradeLimitType,
    autonomyPrepay,
  ])
}

export function useAutoSwapCallback(
  trade: V2Trade<Currency, Currency, TradeType> | V3Trade<Currency, Currency, TradeType> | undefined, // trade to execute, required
  allowedSlippage: Percent, // in bips
  recipientAddressOrName: string | null, // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
  signatureData: SignatureData | undefined | null,
  tradeLimitType?: string,
  outputMinMaxAmount?: string
): { state: SwapCallbackState; callback: null | (() => Promise<string>); error: ReactNode | null } {
  const { account, chainId, library } = useActiveWeb3React()

  const swapCalls = useAutoSwapCallArguments(
    trade,
    allowedSlippage,
    recipientAddressOrName,
    signatureData,
    tradeLimitType,
    outputMinMaxAmount
  )

  const addTransaction = useTransactionAdder()

  const routerContract = useV2RouterContract()
  const [autonomyPrepay] = useAutonomyPaymentManager()
  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress

  return useMemo(() => {
    if (!trade || !library || !account || !chainId) {
      return { state: SwapCallbackState.INVALID, callback: null, error: <Trans>Missing dependencies</Trans> }
    }
    if (!recipient) {
      if (recipientAddressOrName !== null) {
        return { state: SwapCallbackState.INVALID, callback: null, error: <Trans>Invalid recipient</Trans> }
      } else {
        return { state: SwapCallbackState.LOADING, callback: null, error: null }
      }
    }

    return {
      state: SwapCallbackState.VALID,
      callback: async function onSwap(): Promise<string> {
        const estimatedCalls: EstimatedSwapCall[] = await Promise.all(
          swapCalls.map((call) => {
            const {
              parameters: { methodName, args, value },
              contract,
            } = call
            if (tradeLimitType) {
              if (methodName === 'invalid_swapExactTokensForTokensSupportingFeeOnTransferTokens') {
                console.log("Fee On Transfer isn't supported for limits and stops")
                return { call, error: new Error("Fee On Transfer isn't supported for limits and stops") }
              }
            }
            const options = !value || isZero(value) ? {} : { value }
            return contract.estimateGas[methodName](...args, options)
              .then((gasEstimate) => {
                return {
                  call,
                  gasEstimate,
                }
              })
              .catch((gasError) => {
                console.info('Gas estimate failed, trying eth_call to extract error', call)
                return contract.callStatic[methodName](...args, options)
                  .then((result) => {
                    console.info('Unexpected successful call after failed estimate gas', call, gasError, result)
                    return { call, error: new Error('Unexpected issue with estimating the gas. Please try again.') }
                  })
                  .catch((callError) => {
                    console.info('Call threw error', call, callError)
                    let errorMessage: string
                    switch (callError.reason) {
                      case 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT':
                      case 'UniswapV2Router: EXCESSIVE_INPUT_AMOUNT':
                        errorMessage =
                          'This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.'
                        break
                      default:
                        errorMessage = `The transaction cannot succeed due to error: ${
                          callError.reason || callError.data?.message || callError.message
                        }. This is probably an issue with one of the tokens you are swapping.`
                    }
                    return { call, error: new Error(errorMessage) }
                  })
              })
          })
        )
        // a successful estimation is a bignumber gas estimate and the next call is also a bignumber gas estimate
        const successfulEstimation = estimatedCalls.find(
          (el, ix, list): el is SuccessfulCall =>
            'gasEstimate' in el && (ix === list.length - 1 || 'gasEstimate' in list[ix + 1])
        )
        if (!successfulEstimation) {
          const errorCalls = estimatedCalls.filter((call): call is FailedCall => 'error' in call)
          if (errorCalls.length > 0) throw errorCalls[errorCalls.length - 1].error
          throw new Error('Unexpected error. Please contact support: none of the calls threw an error')
        }
        const {
          call: {
            contract,
            parameters: { methodName, args, value },
          },
          gasEstimate,
        } = successfulEstimation
        // TODO: check Pre-pay fee vs Input Token value
        if (!tradeLimitType && !autonomyPrepay && routerContract) {
          const v2Trade = trade as V2Trade<Currency, Currency, TradeType>
          const gasPrice = parseUnits('5', 'gwei').toString()
          const gasFee = BigNumber.from('300000').mul(gasPrice)
          const inputCurrencyDecimals = trade.inputAmount.currency.decimals || 18
          const inputTokenAmount = parseEther(trade.inputAmount.toSignificant(6)).div(
            10 ** (18 - inputCurrencyDecimals)
          )
          let isEligible = false
          if (v2Trade.route.path[0].address === WETH9_EXTENDED[chainId].address) {
            // In case input token is BNB
            isEligible = inputTokenAmount.gt(gasFee)
          } else {
            const [, bnbAmount] = await routerContract.getAmountsOut(inputTokenAmount, [
              v2Trade.route.path[0].address,
              WETH9_EXTENDED[chainId].address,
            ])
            isEligible = (bnbAmount as BigNumber).gt(gasFee)
          }
          if (!isEligible && !window.location.href.includes('swap')) {
            throw new Error('It is unlikely that this amount is enough to cover the cost of execution')
          }
          if (TRASNFER_FEE_TOKEN_ADDRESS_LIST[chainId].includes(trade.inputAmount.currency.name || 'NonAddress')) {
            throw new Error("Fee On Transfer isn't supported for limits and stops")
          }
        }
        return contract[methodName](...args, {
          gasLimit: calculateGasMargin(gasEstimate),
          ...(value && !isZero(value) ? { value, from: account } : { from: account }),
        })
          .then((response: any) => {
            const inputSymbol = trade.inputAmount.currency.symbol
            const outputSymbol = trade.outputAmount.currency.symbol
            const inputAmount = trade.inputAmount.toSignificant(3)
            const outputAmount = trade.outputAmount.toSignificant(3)
            const base = `${
              tradeLimitType === 'limit-order' ? 'Limit Order' : 'Stop Loss'
            } ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`
            const withRecipient =
              recipient === account
                ? base
                : `${base} to ${
                    recipientAddressOrName && isAddress(recipientAddressOrName)
                      ? shortenAddress(recipientAddressOrName)
                      : recipientAddressOrName
                  }`
            addTransaction(response, {
              type: tradeLimitType === 'limit-order' ? TransactionType.LIMIT_ORDER : TransactionType.STOP_LOSS,
              summary: withRecipient,
            })
            return response.hash
          })
          .catch((error: any) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error('Transaction rejected.')
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Swap failed`, error, methodName, args, value)
              throw new Error(`Swap failed: ${error.message}`)
            }
          })
      },
      error: null,
    }
  }, [
    trade,
    library,
    account,
    chainId,
    recipient,
    recipientAddressOrName,
    swapCalls,
    addTransaction,
    autonomyPrepay,
    routerContract,
    tradeLimitType,
  ])
}
