import { Trans } from '@lingui/macro'
import { SupportedChainId } from 'constants/chains'
import { ROUTER_INFO, SupportedRouter } from 'constants/routers'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { useActiveWeb3React } from 'hooks/web3'
import { useCallback, useRef } from 'react'
import { ChevronDown } from 'react-feather'
import { useModalOpen, useRouterName, useToggleModal } from 'state/application/hooks'
import { ApplicationModal, updateRouterName } from 'state/application/reducer'
import { useAppDispatch } from 'state/hooks'
import { setActiveList } from 'state/lists/actions'
import styled from 'styled-components/macro'
import { MEDIA_WIDTHS } from 'theme'

const FlyoutHeader = styled.div`
  color: ${({ theme }) => theme.text2};
  font-weight: 400;
`
const FlyoutMenu = styled.div`
  align-items: flex-start;
  background-color: ${({ theme }) => theme.bg1};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  font-size: 16px;
  overflow: auto;
  padding: 16px;
  position: absolute;
  top: 64px;
  width: 272px;
  z-index: 99;
  & > *:not(:last-child) {
    margin-bottom: 12px;
  }
  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    top: 50px;
  }
`
const FlyoutRow = styled.div<{ active: boolean }>`
  align-items: center;
  background-color: ${({ active, theme }) => (active ? theme.bg2 : 'transparent')};
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  font-weight: 500;
  justify-content: space-between;
  padding: 6px 8px;
  text-align: left;
  width: 100%;
`
const FlyoutRowActiveIndicator = styled.div`
  background-color: ${({ theme }) => theme.green1};
  border-radius: 50%;
  height: 9px;
  width: 9px;
`
const Logo = styled.img`
  height: 20px;
  width: 20px;
  margin-right: 8px;
`
const NetworkLabel = styled.div`
  flex: 1 1 auto;
`
const SelectorLabel = styled(NetworkLabel)`
  display: none;
  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    display: block;
    margin-right: 8px;
  }
`
const SelectorControls = styled.div<{ interactive: boolean }>`
  align-items: center;
  background-color: ${({ theme }) => theme.bg1};
  border: 2px solid ${({ theme }) => theme.bg1};
  border-radius: 12px;
  color: ${({ theme }) => theme.text1};
  cursor: ${({ interactive }) => (interactive ? 'pointer' : 'auto')};
  display: flex;
  font-weight: 500;
  justify-content: space-between;
  padding: 6px 8px;
`
const SelectorLogo = styled(Logo)<{ interactive?: boolean }>`
  margin-right: ${({ interactive }) => (interactive ? 8 : 0)}px;
  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    margin-right: 8px;
  }
`
const SelectorWrapper = styled.div`
  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    position: relative;
  }
`
const StyledChevronDown = styled(ChevronDown)`
  width: 12px;
`

export default function RouterSelector() {
  const { chainId } = useActiveWeb3React()
  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.ROUTER_SELECTOR)
  const toggle = useToggleModal(ApplicationModal.ROUTER_SELECTOR)
  useOnClickOutside(node, open ? toggle : undefined)
  const dispatch = useAppDispatch()
  const routerName = useRouterName()

  if (!routerName) {
    return null
  }

  const bscInfo = ROUTER_INFO[routerName]

  function Row({ targetRouter }: { targetRouter: SupportedRouter }) {
    const active = targetRouter === routerName
    const routerInfo = ROUTER_INFO[targetRouter]
    const rowText = routerInfo.label
    const handleRowClick = useCallback(() => {
      dispatch(updateRouterName({ routerName: targetRouter }))
      dispatch(setActiveList([routerInfo.tokenListUrl]))
      toggle()
    }, [routerInfo, targetRouter])

    const RowContent = () => (
      <FlyoutRow onClick={handleRowClick} active={active}>
        <Logo src={routerInfo.logoUrl} />
        <NetworkLabel>{rowText}</NetworkLabel>
        {active && <FlyoutRowActiveIndicator />}
      </FlyoutRow>
    )
    return <RowContent />
  }

  return (
    <SelectorWrapper ref={node as any}>
      <SelectorControls onClick={toggle} interactive>
        <SelectorLogo interactive src={bscInfo.logoUrl || bscInfo.logoUrl} />
        <SelectorLabel>{bscInfo.label}</SelectorLabel>
        <StyledChevronDown />
      </SelectorControls>
      {open && (
        <FlyoutMenu>
          <FlyoutHeader>
            <Trans>Select a router</Trans>
          </FlyoutHeader>
          {chainId === SupportedChainId.BSC && (
            <>
              <Row targetRouter={SupportedRouter.APESWAP} />
              <Row targetRouter={SupportedRouter.PANCAKESWAP} />
            </>
          )}
          {chainId === SupportedChainId.AVAX && (
            <>
              <Row targetRouter={SupportedRouter.TRADERJOE} />
            </>
          )}
        </FlyoutMenu>
      )}
    </SelectorWrapper>
  )
}
