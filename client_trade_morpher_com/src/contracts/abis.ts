export const morpherOracleAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "AddressBlackListed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "AddressWhiteListed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "_orderId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_address",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "_marketId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_closeSharesAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_openMPHTokenAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "_tradeDirection",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_orderLeverage",
        type: "uint256",
      },
    ],
    name: "AdminLiquidationOrderCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "_orderId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_oracleAddress",
        type: "address",
      },
    ],
    name: "AdminOrderCancelled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "CallBackCollectionAddressChange",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "CallbackAddressDisabled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "CallbackAddressEnabled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "_marketId",
        type: "bytes32",
      },
    ],
    name: "DelistMarketComplete",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "_marketId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_processedUntilIndex",
        type: "uint256",
      },
    ],
    name: "DelistMarketIncomplete",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint8",
        name: "version",
        type: "uint8",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "LinkMorpherState",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "LinkTradeEngine",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "LinkWMatic",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "_orderId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "_sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_address",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "_marketId",
        type: "bytes32",
      },
    ],
    name: "LiquidationOrderCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "_marketId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_price",
        type: "uint256",
      },
    ],
    name: "LockedPriceForClosingPositions",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bool",
        name: "_paused",
        type: "bool",
      },
    ],
    name: "OraclePaused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "_orderId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_sender",
        type: "address",
      },
    ],
    name: "OrderCancellationRequestedEvent",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "_orderId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_oracleAddress",
        type: "address",
      },
    ],
    name: "OrderCancelled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "_orderId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_address",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "_marketId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_closeSharesAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_openMPHTokenAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "_tradeDirection",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_orderLeverage",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_onlyIfPriceBelow",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_onlyIfPriceAbove",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_goodFrom",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_goodUntil",
        type: "uint256",
      },
    ],
    name: "OrderCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "_orderId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_address",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "_marketId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_closeSharesAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_openMPHTokenAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "_tradeDirection",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_orderLeverage",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_onlyIfPriceBelow",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_onlyIfPriceAbove",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_goodFrom",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_goodUntil",
        type: "uint256",
      },
    ],
    name: "OrderFailed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "_orderId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_price",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_unadjustedMarketPrice",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_spread",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_positionLiquidationTimestamp",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_timeStamp",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_newLongShares",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_newShortShares",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_newMeanEntry",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_newMeanSprad",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_newMeanLeverage",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_liquidationPrice",
        type: "uint256",
      },
    ],
    name: "OrderProcessed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "_gasForCallback",
        type: "uint256",
      },
    ],
    name: "SetGasForCallback",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bool",
        name: "_useWhiteList",
        type: "bool",
      },
    ],
    name: "SetUseWhiteList",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    inputs: [],
    name: "ADMINISTRATOR_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "ORACLEOPERATOR_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "PAUSER_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "UNISWAP_ROUTER",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "_HASHED_NAME",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "_HASHED_VERSION",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "_PERMIT_TYPEHASH",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "_TYPE_HASH",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "callBackAddress",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "callBackCollectionAddress",
    outputs: [
      {
        internalType: "address payable",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "gasForCallback",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "goodFrom",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "goodUntil",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "orderCancellationRequested",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "poolFee",
    outputs: [
      {
        internalType: "uint24",
        name: "",
        type: "uint24",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "priceAbove",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "priceBelow",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "useWhiteList",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "wMaticAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "whiteList",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_morpherState",
        type: "address",
      },
      {
        internalType: "address payable",
        name: "_gasCollectionAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_gasForCallback",
        type: "uint256",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "setStateAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "setWmaticAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_gasForCallback",
        type: "uint256",
      },
    ],
    name: "overrideGasForCallback",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "_address",
        type: "address",
      },
    ],
    name: "setCallbackCollectionAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_orderId",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "_marketId",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "_closeSharesAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_openMPHTokenAmount",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_tradeDirection",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "_orderLeverage",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_onlyIfPriceBelow",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_onlyIfPriceAbove",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_goodFrom",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_goodUntil",
        type: "uint256",
      },
    ],
    name: "emitOrderFailed",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "_marketId",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "_closeSharesAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_openMPHTokenAmount",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "_tradeDirection",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "_orderLeverage",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_onlyIfPriceAbove",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_onlyIfPriceBelow",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_goodUntil",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_goodFrom",
            type: "uint256",
          },
        ],
        internalType: "struct MorpherOracle.CreateOrderStruct",
        name: "createOrderParams",
        type: "tuple",
      },
    ],
    name: "createOrder",
    outputs: [
      {
        internalType: "bytes32",
        name: "_orderId",
        type: "bytes32",
      },
    ],
    stateMutability: "payable",
    type: "function",
    payable: true,
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_marketId",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "_closeSharesAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_openMPHTokenAmount",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_tradeDirection",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "_orderLeverage",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_onlyIfPriceAbove",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_onlyIfPriceBelow",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_goodUntil",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_goodFrom",
        type: "uint256",
      },
    ],
    name: "createOrder",
    outputs: [
      {
        internalType: "bytes32",
        name: "_orderId",
        type: "bytes32",
      },
    ],
    stateMutability: "payable",
    type: "function",
    payable: true,
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "_marketId",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "_closeSharesAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_openMPHTokenAmount",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "_tradeDirection",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "_orderLeverage",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_onlyIfPriceAbove",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_onlyIfPriceBelow",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_goodUntil",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_goodFrom",
            type: "uint256",
          },
        ],
        internalType: "struct MorpherOracle.CreateOrderStruct",
        name: "createOrderParams",
        type: "tuple",
      },
      {
        internalType: "address",
        name: "_addressPositionOwner",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
    ],
    name: "createOrderPermittedBySignature",
    outputs: [
      {
        internalType: "bytes32",
        name: "orderId",
        type: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "_marketId",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "_closeSharesAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_openMPHTokenAmount",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "_tradeDirection",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "_orderLeverage",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_onlyIfPriceAbove",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_onlyIfPriceBelow",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_goodUntil",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_goodFrom",
            type: "uint256",
          },
        ],
        internalType: "struct MorpherOracle.CreateOrderStruct",
        name: "createOrderParams",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "address",
            name: "tokenAddress",
            type: "address",
          },
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "minOutValue",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8",
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32",
          },
        ],
        internalType: "struct MorpherOracle.TokenPermitEIP712Struct",
        name: "inputToken",
        type: "tuple",
      },
    ],
    name: "createOrderFromToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "_marketId",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "_closeSharesAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_openMPHTokenAmount",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "_tradeDirection",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "_orderLeverage",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_onlyIfPriceAbove",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_onlyIfPriceBelow",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_goodUntil",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_goodFrom",
            type: "uint256",
          },
        ],
        internalType: "struct MorpherOracle.CreateOrderStruct",
        name: "createOrderParams",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "address",
            name: "tokenAddress",
            type: "address",
          },
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "minOutValue",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8",
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32",
          },
        ],
        internalType: "struct MorpherOracle.TokenPermitEIP712Struct",
        name: "inputToken",
        type: "tuple",
      },
      {
        internalType: "address",
        name: "_addressPositionOwner",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
    ],
    name: "createOrderFromToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "nonces",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "DOMAIN_SEPARATOR",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_orderId",
        type: "bytes32",
      },
    ],
    name: "initiateCancelOrder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_orderId",
        type: "bytes32",
      },
    ],
    name: "cancelOrder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_orderId",
        type: "bytes32",
      },
    ],
    name: "adminCancelOrder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_orderId",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "_price",
        type: "uint256",
      },
    ],
    name: "checkOrderConditions",
    outputs: [
      {
        internalType: "bool",
        name: "_conditionsMet",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "_marketId",
        type: "bytes32",
      },
    ],
    name: "createLiquidationOrder",
    outputs: [
      {
        internalType: "bytes32",
        name: "_orderId",
        type: "bytes32",
      },
    ],
    stateMutability: "payable",
    type: "function",
    payable: true,
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_orderId",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "_price",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_unadjustedMarketPrice",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_spread",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_liquidationTimestamp",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_timeStamp",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_gasForNextCallback",
        type: "uint256",
      },
    ],
    name: "__callback",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "lastUpdated",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "longShares",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "shortShares",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "meanEntryPrice",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "meanEntrySpread",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "meanEntryLeverage",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "liquidationPrice",
            type: "uint256",
          },
          {
            internalType: "bytes32",
            name: "positionHash",
            type: "bytes32",
          },
        ],
        internalType: "struct MorpherTradeEngine.position",
        name: "createdPosition",
        type: "tuple",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_marketId",
        type: "bytes32",
      },
      {
        internalType: "bool",
        name: "_startFromScratch",
        type: "bool",
      },
    ],
    name: "delistMarket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "_marketId",
        type: "bytes32",
      },
    ],
    name: "adminLiquidationOrder",
    outputs: [
      {
        internalType: "bytes32",
        name: "_orderId",
        type: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "orderId",
        type: "uint256",
      },
    ],
    name: "getTradeEngineFromOrderId",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
] as const;

export const morpherTokenAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_stateAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "_coldStorageOwnerAddress",
        type: "address",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "LinkState",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    payable: true,
    stateMutability: "payable",
    type: "fallback",
  },
  {
    constant: true,
    inputs: [],
    name: "_owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "_spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "_spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "_account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "burn",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "_spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "_from",
        type: "address",
      },
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "emitTransfer",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "_spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "isOwner",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "_stateAddress",
        type: "address",
      },
    ],
    name: "setMorpherState",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "_recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "_tokenAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_tokens",
        type: "uint256",
      },
    ],
    name: "transferAnyERC20Token",
    outputs: [
      {
        internalType: "bool",
        name: "_success",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "_sender",
        type: "address",
      },
      {
        internalType: "address",
        name: "_recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
