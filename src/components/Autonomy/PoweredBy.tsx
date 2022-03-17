import styled from 'styled-components/macro'

import { ThemedText } from '../../theme'

export const PoweredBy = styled(ThemedText.Main)`
  font-size: 10px;
  background: ${({ theme }) => theme.bg2};
  padding: 4px 8px;
  border-radius: 5px;
`
