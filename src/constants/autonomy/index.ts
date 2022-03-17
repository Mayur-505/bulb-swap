import { SupportedChainId } from 'constants/chains'

type AddressMap = { [chainId: number]: string }
type AddressList = { [chainId: number]: string[] }

/**
 * Autonomy Registry Contract
 * !! Only for BSC Mainnet/Testnet
 */
export const REGISTRY_CONTRACT_ADDRESS: AddressMap = {
  [SupportedChainId.BSC]: '0x18d087F8D22D409D3CD366AF00BD7AeF0BF225Db',
  [SupportedChainId.AVAX]: '0x68FCbECa74A7E5D386f74E14682c94DE0e1bC56b',
}

/**
 * Mid Router Contract (Uniswap V2)
 * !! Only for BSC Mainnet/Testnet
 */
export const MIDROUTER_CONTRACT_ADDRESS: AddressMap = {
  [SupportedChainId.BSC]: '0xB231B2c7BeA4F767951E79dD5f4973Bc1ADdB189',
  [SupportedChainId.AVAX]: '0xE3e761127cBD037E18186698a2733d1e71623ebE',
}

export const TRASNFER_FEE_TOKEN_ADDRESS_LIST: AddressList = {
  [SupportedChainId.BSC]: ['YUMMY'],
  [SupportedChainId.AVAX]: ['YUMMY'],
}

export const REGISTRY_CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: 'contract IStakeManager',
        name: 'stakeMan',
        type: 'address',
      },
      {
        internalType: 'contract IOracle',
        name: 'oracle',
        type: 'address',
      },
      {
        internalType: 'contract IForwarder',
        name: 'userForwarder',
        type: 'address',
      },
      {
        internalType: 'contract IForwarder',
        name: 'gasForwarder',
        type: 'address',
      },
      {
        internalType: 'contract IForwarder',
        name: 'userGasForwarder',
        type: 'address',
      },
      {
        internalType: 'string',
        name: 'tokenName',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'tokenSymbol',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'totalAUTOSupply',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
    name: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'target',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address payable',
        name: 'referer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'callData',
        type: 'bytes',
      },
      {
        indexed: false,
        internalType: 'uint112',
        name: 'initEthSent',
        type: 'uint112',
      },
      {
        indexed: false,
        internalType: 'uint112',
        name: 'ethForCall',
        type: 'uint112',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'verifyUser',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'insertFeeAmount',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'payWithAUTO',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'isAlive',
        type: 'bool',
      },
    ],
    name: 'HashedReqAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'HashedReqCancelled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'wasRemoved',
        type: 'bool',
      },
    ],
    name: 'HashedReqExecuted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'HashedReqUnveriAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'HashedReqUnveriCancelled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'wasRemoved',
        type: 'bool',
      },
    ],
    name: 'HashedReqUnveriExecuted',
    type: 'event',
  },
  {
    inputs: [],
    name: 'BASE_BPS',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'GAS_OVERHEAD_AUTO',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'GAS_OVERHEAD_ETH',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'PAY_AUTO_BPS',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'PAY_ETH_BPS',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
      {
        components: [
          {
            internalType: 'address payable',
            name: 'user',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'target',
            type: 'address',
          },
          {
            internalType: 'address payable',
            name: 'referer',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes',
          },
          {
            internalType: 'uint112',
            name: 'initEthSent',
            type: 'uint112',
          },
          {
            internalType: 'uint112',
            name: 'ethForCall',
            type: 'uint112',
          },
          {
            internalType: 'bool',
            name: 'verifyUser',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'insertFeeAmount',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'payWithAUTO',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'isAlive',
            type: 'bool',
          },
        ],
        internalType: 'struct IRegistry.Request',
        name: 'r',
        type: 'tuple',
      },
    ],
    name: 'cancelHashedReq',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
      {
        components: [
          {
            internalType: 'address payable',
            name: 'user',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'target',
            type: 'address',
          },
          {
            internalType: 'address payable',
            name: 'referer',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes',
          },
          {
            internalType: 'uint112',
            name: 'initEthSent',
            type: 'uint112',
          },
          {
            internalType: 'uint112',
            name: 'ethForCall',
            type: 'uint112',
          },
          {
            internalType: 'bool',
            name: 'verifyUser',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'insertFeeAmount',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'payWithAUTO',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'isAlive',
            type: 'bool',
          },
        ],
        internalType: 'struct IRegistry.Request',
        name: 'r',
        type: 'tuple',
      },
      {
        internalType: 'bytes',
        name: 'dataPrefix',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'dataSuffix',
        type: 'bytes',
      },
    ],
    name: 'cancelHashedReqUnveri',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
      {
        components: [
          {
            internalType: 'address payable',
            name: 'user',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'target',
            type: 'address',
          },
          {
            internalType: 'address payable',
            name: 'referer',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes',
          },
          {
            internalType: 'uint112',
            name: 'initEthSent',
            type: 'uint112',
          },
          {
            internalType: 'uint112',
            name: 'ethForCall',
            type: 'uint112',
          },
          {
            internalType: 'bool',
            name: 'verifyUser',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'insertFeeAmount',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'payWithAUTO',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'isAlive',
            type: 'bool',
          },
        ],
        internalType: 'struct IRegistry.Request',
        name: 'r',
        type: 'tuple',
      },
      {
        internalType: 'uint256',
        name: 'expectedGas',
        type: 'uint256',
      },
    ],
    name: 'executeHashedReq',
    outputs: [
      {
        internalType: 'uint256',
        name: 'gasUsed',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
      {
        components: [
          {
            internalType: 'address payable',
            name: 'user',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'target',
            type: 'address',
          },
          {
            internalType: 'address payable',
            name: 'referer',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes',
          },
          {
            internalType: 'uint112',
            name: 'initEthSent',
            type: 'uint112',
          },
          {
            internalType: 'uint112',
            name: 'ethForCall',
            type: 'uint112',
          },
          {
            internalType: 'bool',
            name: 'verifyUser',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'insertFeeAmount',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'payWithAUTO',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'isAlive',
            type: 'bool',
          },
        ],
        internalType: 'struct IRegistry.Request',
        name: 'r',
        type: 'tuple',
      },
      {
        internalType: 'bytes',
        name: 'dataPrefix',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'dataSuffix',
        type: 'bytes',
      },
      {
        internalType: 'uint256',
        name: 'expectedGas',
        type: 'uint256',
      },
    ],
    name: 'executeHashedReqUnveri',
    outputs: [
      {
        internalType: 'uint256',
        name: 'gasUsed',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAUTOAddr',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'addr',
        type: 'address',
      },
    ],
    name: 'getExecCountOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getGasForwarder',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'r',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'dataPrefix',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'dataPostfix',
        type: 'bytes',
      },
    ],
    name: 'getHashedIpfsReq',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'getHashedReq',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'getHashedReqUnveri',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getHashedReqs',
    outputs: [
      {
        internalType: 'bytes32[]',
        name: '',
        type: 'bytes32[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getHashedReqsLen',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'startIdx',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'endIdx',
        type: 'uint256',
      },
    ],
    name: 'getHashedReqsSlice',
    outputs: [
      {
        internalType: 'bytes32[]',
        name: '',
        type: 'bytes32[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getHashedReqsUnveri',
    outputs: [
      {
        internalType: 'bytes32[]',
        name: '',
        type: 'bytes32[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getHashedReqsUnveriLen',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'startIdx',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'endIdx',
        type: 'uint256',
      },
    ],
    name: 'getHashedReqsUnveriSlice',
    outputs: [
      {
        internalType: 'bytes32[]',
        name: '',
        type: 'bytes32[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'r',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'dataPrefix',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'dataPostfix',
        type: 'bytes',
      },
    ],
    name: 'getIpfsReqBytes',
    outputs: [
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getOracle',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'addr',
        type: 'address',
      },
    ],
    name: 'getReferalCountOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address payable',
            name: 'user',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'target',
            type: 'address',
          },
          {
            internalType: 'address payable',
            name: 'referer',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes',
          },
          {
            internalType: 'uint112',
            name: 'initEthSent',
            type: 'uint112',
          },
          {
            internalType: 'uint112',
            name: 'ethForCall',
            type: 'uint112',
          },
          {
            internalType: 'bool',
            name: 'verifyUser',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'insertFeeAmount',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'payWithAUTO',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'isAlive',
            type: 'bool',
          },
        ],
        internalType: 'struct IRegistry.Request',
        name: 'r',
        type: 'tuple',
      },
    ],
    name: 'getReqBytes',
    outputs: [
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'addr',
        type: 'address',
      },
    ],
    name: 'getReqCountOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'rBytes',
        type: 'bytes',
      },
    ],
    name: 'getReqFromBytes',
    outputs: [
      {
        components: [
          {
            internalType: 'address payable',
            name: 'user',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'target',
            type: 'address',
          },
          {
            internalType: 'address payable',
            name: 'referer',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes',
          },
          {
            internalType: 'uint112',
            name: 'initEthSent',
            type: 'uint112',
          },
          {
            internalType: 'uint112',
            name: 'ethForCall',
            type: 'uint112',
          },
          {
            internalType: 'bool',
            name: 'verifyUser',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'insertFeeAmount',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'payWithAUTO',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'isAlive',
            type: 'bool',
          },
        ],
        internalType: 'struct IRegistry.Request',
        name: 'r',
        type: 'tuple',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getStakeManager',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getUserForwarder',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getUserGasForwarder',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'callData',
        type: 'bytes',
      },
      {
        internalType: 'uint256',
        name: 'expectedGas',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'startIdx',
        type: 'uint256',
      },
    ],
    name: 'insertToCallData',
    outputs: [
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'hashedIpfsReq',
        type: 'bytes32',
      },
    ],
    name: 'newHashedReqUnveri',
    outputs: [
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'target',
        type: 'address',
      },
      {
        internalType: 'address payable',
        name: 'referer',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'callData',
        type: 'bytes',
      },
      {
        internalType: 'uint112',
        name: 'ethForCall',
        type: 'uint112',
      },
      {
        internalType: 'bool',
        name: 'verifyUser',
        type: 'bool',
      },
      {
        internalType: 'bool',
        name: 'insertFeeAmount',
        type: 'bool',
      },
      {
        internalType: 'bool',
        name: 'isAlive',
        type: 'bool',
      },
    ],
    name: 'newReq',
    outputs: [
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'target',
        type: 'address',
      },
      {
        internalType: 'address payable',
        name: 'referer',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'callData',
        type: 'bytes',
      },
      {
        internalType: 'uint112',
        name: 'ethForCall',
        type: 'uint112',
      },
      {
        internalType: 'bool',
        name: 'verifyUser',
        type: 'bool',
      },
      {
        internalType: 'bool',
        name: 'insertFeeAmount',
        type: 'bool',
      },
      {
        internalType: 'bool',
        name: 'payWithAUTO',
        type: 'bool',
      },
      {
        internalType: 'bool',
        name: 'isAlive',
        type: 'bool',
      },
    ],
    name: 'newReqPaySpecific',
    outputs: [
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    stateMutability: 'payable',
    type: 'receive',
  },
]

export const MIDROUTER_CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: 'address payable',
        name: 'registry_',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'userVeriForwarder_',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'userFeeVeriForwarder_',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'WETH_',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'contract IUniswapV2Router02',
            name: 'uni',
            type: 'address',
          },
          {
            internalType: 'address[]',
            name: 'path',
            type: 'address[]',
          },
          {
            internalType: 'bool',
            name: 'isAUTO',
            type: 'bool',
          },
        ],
        internalType: 'struct UniV2LimitsStops.FeeInfo',
        name: 'defaultFeeInfo',
        type: 'tuple',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    inputs: [],
    name: 'WETH',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'maxGasPrice',
        type: 'uint256',
      },
      {
        internalType: 'contract IUniswapV2Router02',
        name: 'uni',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amountOutMin',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountOutMax',
        type: 'uint256',
      },
      {
        internalType: 'address[]',
        name: 'path',
        type: 'address[]',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256',
      },
    ],
    name: 'ethToTokenRange',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'feeAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maxGasPrice',
        type: 'uint256',
      },
      {
        internalType: 'contract IUniswapV2Router02',
        name: 'uni',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amountOutMin',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountOutMax',
        type: 'uint256',
      },
      {
        internalType: 'address[]',
        name: 'path',
        type: 'address[]',
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256',
      },
    ],
    name: 'ethToTokenRangePayDefault',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'feeAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maxGasPrice',
        type: 'uint256',
      },
      {
        internalType: 'contract IUniswapV2Router02',
        name: 'uni',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'contract IUniswapV2Router02',
            name: 'uni',
            type: 'address',
          },
          {
            internalType: 'address[]',
            name: 'path',
            type: 'address[]',
          },
          {
            internalType: 'bool',
            name: 'isAUTO',
            type: 'bool',
          },
        ],
        internalType: 'struct UniV2LimitsStops.FeeInfo',
        name: 'feeInfo',
        type: 'tuple',
      },
      {
        internalType: 'uint256',
        name: 'amountOutMin',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountOutMax',
        type: 'uint256',
      },
      {
        internalType: 'address[]',
        name: 'path',
        type: 'address[]',
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256',
      },
    ],
    name: 'ethToTokenRangePaySpecific',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getDefaultFeeInfo',
    outputs: [
      {
        components: [
          {
            internalType: 'contract IUniswapV2Router02',
            name: 'uni',
            type: 'address',
          },
          {
            internalType: 'address[]',
            name: 'path',
            type: 'address[]',
          },
          {
            internalType: 'bool',
            name: 'isAUTO',
            type: 'bool',
          },
        ],
        internalType: 'struct UniV2LimitsStops.FeeInfo',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'registry',
    outputs: [
      {
        internalType: 'address payable',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'contract IUniswapV2Router02',
            name: 'uni',
            type: 'address',
          },
          {
            internalType: 'address[]',
            name: 'path',
            type: 'address[]',
          },
          {
            internalType: 'bool',
            name: 'isAUTO',
            type: 'bool',
          },
        ],
        internalType: 'struct UniV2LimitsStops.FeeInfo',
        name: 'newDefaultFee',
        type: 'tuple',
      },
    ],
    name: 'setDefaultFeeInfo',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'maxGasPrice',
        type: 'uint256',
      },
      {
        internalType: 'contract IUniswapV2Router02',
        name: 'uni',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'inputAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountOutMin',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountOutMax',
        type: 'uint256',
      },
      {
        internalType: 'address[]',
        name: 'path',
        type: 'address[]',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256',
      },
    ],
    name: 'tokenToEthRange',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'feeAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maxGasPrice',
        type: 'uint256',
      },
      {
        internalType: 'contract IUniswapV2Router02',
        name: 'uni',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'inputAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountOutMin',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountOutMax',
        type: 'uint256',
      },
      {
        internalType: 'address[]',
        name: 'path',
        type: 'address[]',
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256',
      },
    ],
    name: 'tokenToEthRangePayDefault',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'feeAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maxGasPrice',
        type: 'uint256',
      },
      {
        internalType: 'contract IUniswapV2Router02',
        name: 'uni',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'contract IUniswapV2Router02',
            name: 'uni',
            type: 'address',
          },
          {
            internalType: 'address[]',
            name: 'path',
            type: 'address[]',
          },
          {
            internalType: 'bool',
            name: 'isAUTO',
            type: 'bool',
          },
        ],
        internalType: 'struct UniV2LimitsStops.FeeInfo',
        name: 'feeInfo',
        type: 'tuple',
      },
      {
        internalType: 'uint256',
        name: 'inputAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountOutMin',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountOutMax',
        type: 'uint256',
      },
      {
        internalType: 'address[]',
        name: 'path',
        type: 'address[]',
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256',
      },
    ],
    name: 'tokenToEthRangePaySpecific',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'maxGasPrice',
        type: 'uint256',
      },
      {
        internalType: 'contract IUniswapV2Router02',
        name: 'uni',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'inputAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountOutMin',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountOutMax',
        type: 'uint256',
      },
      {
        internalType: 'address[]',
        name: 'path',
        type: 'address[]',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256',
      },
    ],
    name: 'tokenToTokenRange',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'feeAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maxGasPrice',
        type: 'uint256',
      },
      {
        internalType: 'contract IUniswapV2Router02',
        name: 'uni',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'inputAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountOutMin',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountOutMax',
        type: 'uint256',
      },
      {
        internalType: 'address[]',
        name: 'path',
        type: 'address[]',
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256',
      },
    ],
    name: 'tokenToTokenRangePayDefault',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'feeAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maxGasPrice',
        type: 'uint256',
      },
      {
        internalType: 'contract IUniswapV2Router02',
        name: 'uni',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'contract IUniswapV2Router02',
            name: 'uni',
            type: 'address',
          },
          {
            internalType: 'address[]',
            name: 'path',
            type: 'address[]',
          },
          {
            internalType: 'bool',
            name: 'isAUTO',
            type: 'bool',
          },
        ],
        internalType: 'struct UniV2LimitsStops.FeeInfo',
        name: 'feeInfo',
        type: 'tuple',
      },
      {
        internalType: 'uint256',
        name: 'inputAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountOutMin',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountOutMax',
        type: 'uint256',
      },
      {
        internalType: 'address[]',
        name: 'path',
        type: 'address[]',
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256',
      },
    ],
    name: 'tokenToTokenRangePaySpecific',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'userFeeVeriForwarder',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'userVeriForwarder',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    stateMutability: 'payable',
    type: 'receive',
  },
]
