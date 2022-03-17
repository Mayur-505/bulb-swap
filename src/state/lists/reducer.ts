import { createReducer } from '@reduxjs/toolkit'
import { getVersionUpgrade, TokenList, VersionUpgrade } from '@uniswap/token-lists'
import { SupportedChainId } from 'constants/chains'

import { DEFAULT_ACTIVE_LIST_URLS } from '../../constants/lists'
import { DEFAULT_LIST_OF_LISTS } from '../../constants/lists'
import { updateVersion } from '../global/actions'
import {
  acceptListUpdate,
  addList,
  disableList,
  enableList,
  fetchTokenList,
  removeList,
  setActiveList,
} from './actions'

export interface ListsState {
  readonly byUrl: {
    readonly [chainId: number]: {
      readonly [url: string]: {
        readonly current: TokenList | null
        readonly pendingUpdate: TokenList | null
        readonly loadingRequestId: string | null
        readonly error: string | null
      }
    }
  }

  // currently active lists
  readonly activeListUrls: string[] | undefined
}

type ListState = ListsState['byUrl'][number][string]

const NEW_LIST_STATE: ListState = {
  error: null,
  current: null,
  loadingRequestId: null,
  pendingUpdate: null,
}

type Mutable<T> = { -readonly [P in keyof T]: T[P] extends ReadonlyArray<infer U> ? U[] : T[P] }

const initialState: ListsState = {
  byUrl: {
    [SupportedChainId.BSC]: {
      ...DEFAULT_LIST_OF_LISTS[SupportedChainId.BSC].reduce<Mutable<ListsState['byUrl'][SupportedChainId.BSC]>>(
        (memo, listUrl) => {
          memo[listUrl] = NEW_LIST_STATE
          return memo
        },
        {}
      ),
    },
    [SupportedChainId.AVAX]: {
      ...DEFAULT_LIST_OF_LISTS[SupportedChainId.AVAX].reduce<Mutable<ListsState['byUrl'][SupportedChainId.BSC]>>(
        (memo, listUrl) => {
          memo[listUrl] = NEW_LIST_STATE
          return memo
        },
        {}
      ),
    },
  },
  activeListUrls: DEFAULT_ACTIVE_LIST_URLS[SupportedChainId.BSC],
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(fetchTokenList.pending, (state, { payload: { requestId, url, chainId } }) => {
      const current = state.byUrl[chainId][url]?.current ?? null
      const pendingUpdate = state.byUrl[chainId][url]?.pendingUpdate ?? null

      state.byUrl[chainId][url] = {
        current,
        pendingUpdate,
        loadingRequestId: requestId,
        error: null,
      }
    })
    .addCase(fetchTokenList.fulfilled, (state, { payload: { requestId, tokenList, url, chainId } }) => {
      const current = state.byUrl[chainId][url]?.current
      const loadingRequestId = state.byUrl[chainId][url]?.loadingRequestId

      // no-op if update does nothing
      if (current) {
        const upgradeType = getVersionUpgrade(current.version, tokenList.version)

        if (upgradeType === VersionUpgrade.NONE) return
        if (loadingRequestId === null || loadingRequestId === requestId) {
          state.byUrl[chainId][url] = {
            current,
            pendingUpdate: tokenList,
            loadingRequestId: null,
            error: null,
          }
        }
      } else {
        // activate if on default active
        if (DEFAULT_ACTIVE_LIST_URLS[chainId].includes(url) && !state.activeListUrls?.includes(url)) {
          state.activeListUrls?.push(url)
        }

        state.byUrl[chainId][url] = {
          current: tokenList,
          pendingUpdate: null,
          loadingRequestId: null,
          error: null,
        }
      }
    })
    .addCase(fetchTokenList.rejected, (state, { payload: { url, requestId, errorMessage, chainId } }) => {
      if (state.byUrl[chainId][url]?.loadingRequestId !== requestId) {
        // no-op since it's not the latest request
        return
      }

      state.byUrl[chainId][url] = {
        current: state.byUrl[chainId][url].current ? state.byUrl[chainId][url].current : null,
        pendingUpdate: null,
        loadingRequestId: null,
        error: errorMessage,
      }
    })
    .addCase(addList, (state, { payload: { url, chainId } }) => {
      if (!state.byUrl[chainId][url]) {
        state.byUrl[chainId][url] = NEW_LIST_STATE
      }
    })
    .addCase(removeList, (state, { payload: { url, chainId } }) => {
      if (state.byUrl[chainId][url]) {
        delete state.byUrl[chainId][url]
      }
      // remove list from active urls if needed
      if (state.activeListUrls && state.activeListUrls.includes(url)) {
        state.activeListUrls = state.activeListUrls.filter((u) => u !== url)
      }
    })
    .addCase(enableList, (state, { payload: { url, chainId } }) => {
      if (!state.byUrl[chainId][url]) {
        state.byUrl[chainId][url] = NEW_LIST_STATE
      }

      if (state.activeListUrls && !state.activeListUrls.includes(url)) {
        state.activeListUrls.push(url)
      }

      if (!state.activeListUrls) {
        state.activeListUrls = [url]
      }
    })
    .addCase(disableList, (state, { payload: { url, chainId } }) => {
      if (state.activeListUrls && state.activeListUrls.includes(url)) {
        state.activeListUrls = state.activeListUrls.filter((u) => u !== url)
      }
    })
    .addCase(acceptListUpdate, (state, { payload: { url, chainId } }) => {
      if (!state.byUrl[chainId][url]?.pendingUpdate) {
        throw new Error('accept list update called without pending update')
      }
      state.byUrl[chainId][url] = {
        ...state.byUrl[chainId][url],
        current: state.byUrl[chainId][url].pendingUpdate,
        pendingUpdate: null,
      }
    })
    .addCase(setActiveList, (state, { payload: urls }) => {
      state.activeListUrls = urls
    })
    .addCase(updateVersion, (state) => {
      // state loaded from localStorage, but new lists have never been initialized
      state.byUrl = initialState.byUrl
      state.activeListUrls = initialState.activeListUrls
    })
)
