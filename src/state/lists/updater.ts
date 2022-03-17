import { getVersionUpgrade, minVersionBump, VersionUpgrade } from '@uniswap/token-lists'
import { SupportedChainId } from 'constants/chains'
import { UNSUPPORTED_LIST_URLS } from 'constants/lists'
import { ROUTER_INFO } from 'constants/routers'
import { useCallback, useEffect } from 'react'
import { useRouterName } from 'state/application/hooks'
import { useAppDispatch } from 'state/hooks'
import { useAllLists } from 'state/lists/hooks'

import { useFetchListCallback } from '../../hooks/useFetchListCallback'
import useInterval from '../../hooks/useInterval'
import useIsWindowVisible from '../../hooks/useIsWindowVisible'
import { useActiveWeb3React } from '../../hooks/web3'
import { acceptListUpdate, enableList } from './actions'
import { useActiveListUrls } from './hooks'

export default function Updater(): null {
  const { chainId = SupportedChainId.BSC, library } = useActiveWeb3React()
  const dispatch = useAppDispatch()
  const isWindowVisible = useIsWindowVisible()

  // get all loaded lists, and the active urls
  const lists = useAllLists()
  const activeListUrls = useActiveListUrls()

  const fetchList = useFetchListCallback()
  const fetchAllListsCallback = useCallback(() => {
    if (!isWindowVisible) return
    Object.keys(lists[chainId]).forEach((url) =>
      fetchList(url).catch((error) => console.debug('interval list fetching error', error))
    )
  }, [fetchList, isWindowVisible, lists, chainId])

  const routerName = useRouterName()

  useEffect(() => {
    const routerInfo = ROUTER_INFO[routerName]
    if (routerName && routerInfo.chainId === chainId) {
      dispatch(enableList({ url: routerInfo.tokenListUrl, chainId }))
    }
  }, [routerName, dispatch, chainId])
  // fetch all lists every 10 minutes, but only after we initialize library
  useInterval(fetchAllListsCallback, library ? 1000 * 60 * 10 : null)

  // whenever a list is not loaded and not loading, try again to load it
  useEffect(() => {
    Object.keys(lists[chainId]).forEach((listUrl) => {
      const list = lists[chainId][listUrl]
      if (!list.current && !list.loadingRequestId && !list.error) {
        fetchList(listUrl).catch((error) => console.debug('list added fetching error', error))
      }
    })
  }, [dispatch, fetchList, library, lists, chainId])

  // if any lists from unsupported lists are loaded, check them too (in case new updates since last visit)
  useEffect(() => {
    UNSUPPORTED_LIST_URLS.forEach((listUrl) => {
      const list = lists[chainId][listUrl]
      if (!list || (!list.current && !list.loadingRequestId && !list.error)) {
        fetchList(listUrl).catch((error) => console.debug('list added fetching error', error))
      }
    })
  }, [dispatch, fetchList, library, lists, chainId])

  // automatically update lists if versions are minor/patch
  useEffect(() => {
    Object.keys(lists[chainId]).forEach((listUrl) => {
      const list = lists[chainId][listUrl]
      if (list.current && list.pendingUpdate) {
        const bump = getVersionUpgrade(list.current.version, list.pendingUpdate.version)
        switch (bump) {
          case VersionUpgrade.NONE:
            throw new Error('unexpected no version bump')
          case VersionUpgrade.PATCH:
          case VersionUpgrade.MINOR:
            const min = minVersionBump(list.current.tokens, list.pendingUpdate.tokens)
            // automatically update minor/patch as long as bump matches the min update
            if (bump >= min) {
              dispatch(acceptListUpdate({ url: listUrl, chainId }))
            } else {
              console.error(
                `List at url ${listUrl} could not automatically update because the version bump was only PATCH/MINOR while the update had breaking changes and should have been MAJOR`
              )
            }
            break

          // update any active or inactive lists
          case VersionUpgrade.MAJOR:
            dispatch(acceptListUpdate({ url: listUrl, chainId }))
        }
      }
    })
  }, [dispatch, lists, activeListUrls, chainId])

  return null
}
