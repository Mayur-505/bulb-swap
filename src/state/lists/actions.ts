import { ActionCreatorWithPayload, createAction } from '@reduxjs/toolkit'
import { TokenList } from '@uniswap/token-lists'

type NewType = {
  pending: ActionCreatorWithPayload<{ url: string; requestId: string; chainId: number }>
  fulfilled: ActionCreatorWithPayload<{ url: string; tokenList: TokenList; requestId: string; chainId: number }>
  rejected: ActionCreatorWithPayload<{ url: string; errorMessage: string; requestId: string; chainId: number }>
}

type ListType = { url: string; chainId: number }

export const fetchTokenList: Readonly<NewType> = {
  pending: createAction('lists/fetchTokenList/pending'),
  fulfilled: createAction('lists/fetchTokenList/fulfilled'),
  rejected: createAction('lists/fetchTokenList/rejected'),
}
// add and remove from list options
export const addList = createAction<ListType>('lists/addList')
export const removeList = createAction<ListType>('lists/removeList')

// select which lists to search across from loaded lists
export const enableList = createAction<ListType>('lists/enableList')
export const disableList = createAction<ListType>('lists/disableList')

export const setActiveList = createAction<string[]>('lists/setActiveList')

// versioning
export const acceptListUpdate = createAction<ListType>('lists/acceptListUpdate')
