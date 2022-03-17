import { formatUnits } from '@ethersproject/units'
import { Token } from '@uniswap/sdk-core'
import React, { useCallback } from 'react'

import { useRegistryContract } from '../../hooks/useContract'
import CurrencyLogo from '../CurrencyLogo'
import { Transaction } from './AutonomyHistoryStyles'

interface TxProps {
  tx: any
  tokenPair: {
    input: Token
    output: Token
  }
}

export default function AutonomyTransaction({ tx, tokenPair }: TxProps) {
  const registryContract = useRegistryContract()

  const cancelTx = useCallback(async () => {
    if (!registryContract) return
    const transaction = await registryContract.cancelHashedReq(tx.id, [
      tx.requester,
      tx.target,
      tx.referer,
      tx.callData,
      tx.initEthSent,
      tx.ethForCall,
      tx.verifySender,
      tx.insertFeeAmount,
      tx.payWithAuto,
    ])
    await transaction.wait()
  }, [tx, registryContract])

  const isMobile = window.innerWidth <= 500

  const inputAmount = formatUnits(tx.inputAmount, tokenPair.input?.decimals)
  const outputAmount = formatUnits(tx.outputAmount, tokenPair.output?.decimals)

  if (!tx || !tokenPair) return null

  return (
    <Transaction>
      <div className="txContainer">
        <small style={{ fontSize: '15px', fontWeight: 'bold', textDecoration: 'underline' }}>{tx.typeof}</small>
        <div style={{ marginTop: '2px' }} className="txInfo">
          <p style={{ margin: 0, fontWeight: 'bold' }}>
            Sell
            <span className="token">
              <CurrencyLogo currency={tokenPair.input} size="14px" style={{ marginRight: '5px' }} />
              {isMobile ? inputAmount.substring(0, 10) : inputAmount.substring(0, 20)}
              <span style={{ fontWeight: 'bold', marginLeft: '2px' }}>{tokenPair.input?.symbol}</span>
            </span>
          </p>
          <p style={{ margin: 0, fontWeight: 'bold' }}>
            Buy
            <span className="token">
              <CurrencyLogo currency={tokenPair.output} size="14px" style={{ marginRight: '5px' }} />
              {isMobile ? outputAmount.substring(0, 10) : outputAmount.substring(0, 20)}
              <span style={{ fontWeight: 'bold', marginLeft: '2px' }}> {tokenPair.output?.symbol}</span>
            </span>
          </p>
        </div>
        <div className="limit_box_footer">
          <div className="txTime">
            <small>
              <i>Placed On: {tx.time}</i>
            </small>
          </div>
          <div className="action">
            {tx.status === 'open' && (
              <button type="button" onClick={cancelTx}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </Transaction>
  )
}
