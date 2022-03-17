import { Trans } from '@lingui/macro'
import { loadingOpacityMixin } from 'components/Loader/styled'
import { useActiveWeb3React } from 'hooks/web3'
import { darken } from 'polished'
import styled from 'styled-components/macro'

import useTheme from '../../hooks/useTheme'
import { ThemedText } from '../../theme'
import { Input as NumericalInput } from '../NumericalInput'
import { RowBetween, RowFixed } from '../Row'

const InputPanel = styled.div<{ hideInput?: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '16px' : '20px')};
  background-color: ${({ theme, hideInput }) => (hideInput ? 'transparent' : theme.bg2)};
  z-index: 1;
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
`

const Container = styled.div<{ hideInput?: boolean }>`
  border-radius: ${({ hideInput }) => (hideInput ? '16px' : '20px')};
  border: 1px solid ${({ theme, hideInput }) => (hideInput ? ' transparent' : theme.bg2)};
  background-color: ${({ theme }) => theme.bg1};
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  :focus,
  :hover {
    border: 1px solid ${({ theme, hideInput }) => (hideInput ? ' transparent' : theme.bg3)};
  }
`

const InputRow = styled.div<{ selected: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: space-between;
  padding: ${({ selected }) => (selected ? ' 1rem 1rem 0.75rem 1rem' : '1rem 1rem 0.75rem 1rem')};
`

const LabelRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: flex-end;
  color: ${({ theme }) => theme.text1};
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0 1rem 1rem;
  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.text2)};
  }
`

const CurrentPrice = styled(ThemedText.Body)`
  display: inline;
  cursor: pointer;
  padding: 4px 8px;
  border: 1px solid ${({ theme }) => theme.blue1};
  background: ${({ theme }) => theme.primary5};
  border-radius: 20px;
`

const StyledNumericalInput = styled(NumericalInput)<{ $loading: boolean }>`
  ${loadingOpacityMixin}
`

interface RateInputPanelProps {
  id: string
  value: string
  currentPrice?: string
  onUserInput: (value: string) => void
  loading?: boolean
}

export default function RateInputPanel({
  id,
  value,
  currentPrice = '0',
  onUserInput,
  loading = false,
}: RateInputPanelProps) {
  const { account } = useActiveWeb3React()
  const theme = useTheme()

  return (
    <InputPanel id={id}>
      <Container>
        <InputRow selected={false}>
          <span>Rate</span>
          <StyledNumericalInput
            value={value}
            className="token-amount-input"
            onUserInput={onUserInput}
            $loading={loading}
          />
        </InputRow>
        <LabelRow>
          <RowBetween>
            {account ? (
              <RowFixed style={{ height: '17px' }}>
                <CurrentPrice
                  color={theme.text1}
                  fontWeight={400}
                  fontSize={14}
                  onClick={() => onUserInput(currentPrice)}
                >
                  <Trans>Current: {currentPrice}</Trans>
                </CurrentPrice>
              </RowFixed>
            ) : (
              <span />
            )}
          </RowBetween>
        </LabelRow>
      </Container>
    </InputPanel>
  )
}
