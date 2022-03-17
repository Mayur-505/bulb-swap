import { getAddress } from '@ethersproject/address'
import React, { useState } from 'react'

import { useAllTokens } from '../../hooks/Tokens'
import useTransactionHistory from '../../hooks/useAutonomyHistory'
import { Container, TabContent, Tabs } from './AutonomyHistoryStyles'
import AutonomyTransaction from './AutonomyTransaction'

export default function AutonomyHistory(type: any) {
  const [transactions] = useTransactionHistory()
  const allTokens = useAllTokens()
  const [currentTab, setCurrentTab] = useState('open')
  const mode = type

  const txTokenPairs = transactions
    .map((tx: any) => {
      if (tx && tx.inputToken && tx.outputToken) {
        return {
          input: allTokens[getAddress(tx.inputToken)],
          output: allTokens[getAddress(tx.outputToken)],
        }
      }
      return null as any
    })
    .filter((txPair: any) => !!txPair)

  return (
    <Container>
      <Tabs>
        <div onClick={() => setCurrentTab('open')} className={`tabItem ${currentTab === 'open' ? 'active' : ''}`}>
          <span>Open</span>
        </div>
        <div
          onClick={() => setCurrentTab('cancelled')}
          className={`tabItem ${currentTab === 'cancelled' ? 'active' : ''}`}
        >
          <span>Cancelled</span>
        </div>
        <div
          onClick={() => setCurrentTab('executed')}
          className={`tabItem ${currentTab === 'executed' ? 'active' : ''}`}
        >
          <span>Executed</span>
        </div>
      </Tabs>
      <TabContent>
        {transactions.map(
          (tx: any, i: number) =>
            tx &&
            tx.typeof === mode.type &&
            tx.status === currentTab && <AutonomyTransaction key={i} tx={tx} tokenPair={txTokenPairs[i]} />
        )}
      </TabContent>
    </Container>
  )
}
