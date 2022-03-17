import { DEFAULT_LIST_OF_LISTS } from 'constants/lists'

// use ordering of default list of lists to assign priority
export const sortByListPriority = (chainId: number) => (urlA: string, urlB: string) => {
  const DEFAULT_LIST_PRIORITIES = DEFAULT_LIST_OF_LISTS[chainId].reduce<{
    [listUrl: string]: number
  }>((memo, listUrl, index) => {
    memo[listUrl] = index + 1
    return memo
  }, {})

  if (DEFAULT_LIST_PRIORITIES[urlA] && DEFAULT_LIST_PRIORITIES[urlB]) {
    return DEFAULT_LIST_PRIORITIES[urlA] - DEFAULT_LIST_PRIORITIES[urlB]
  }
  return 0
}

export default sortByListPriority
