
import { Abi } from "starknet";
import {  RpcProvider } from "starknet";
export const TIC_CONTRACT_ADDRESS =
  "0x23a484ad8053494875e38dfa9069e35a7c416665d3abef861a27a2c64f20a53";
  export const STRK_TOKEN_ADDRESS =
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

export const voyagerScanBaseUrl = "https://sepolia.voyager.online";

export const provider = new RpcProvider({
  nodeUrl: "https://api.cartridge.gg/x/starknet/sepolia",
});



export const ERC20Abi: Abi = [
  {
    inputs: [],
    name: "finalized",
    outputs: [
      {
        name: "res",
        type: "felt",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    data: [
      {
        name: "new_governor_nominee",
        type: "felt",
      },
      {
        name: "nominated_by",
        type: "felt",
      },
    ],
    keys: [],
    name: "governor_nominated",
    type: "event",
  },
  {
    data: [
      {
        name: "cancelled_nominee",
        type: "felt",
      },
      {
        name: "cancelled_by",
        type: "felt",
      },
    ],
    keys: [],
    name: "nomination_cancelled",
    type: "event",
  },
  {
    data: [
      {
        name: "removed_governor",
        type: "felt",
      },
      {
        name: "removed_by",
        type: "felt",
      },
    ],
    keys: [],
    name: "governor_removed",
    type: "event",
  },
  {
    data: [
      {
        name: "new_governor",
        type: "felt",
      },
    ],
    keys: [],
    name: "governance_accepted",
    type: "event",
  },
  {
    inputs: [
      {
        name: "account",
        type: "felt",
      },
    ],
    name: "is_governor",
    outputs: [
      {
        name: "is_governor_",
        type: "felt",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        name: "nominee",
        type: "felt",
      },
    ],
    name: "nominate_new_governor",
    outputs: [],
    type: "function",
  },
  {
    inputs: [
      {
        name: "cancelee",
        type: "felt",
      },
    ],
    name: "cancel_nomination",
    outputs: [],
    type: "function",
  },
  {
    inputs: [
      {
        name: "removee",
        type: "felt",
      },
    ],
    name: "remove_governor",
    outputs: [],
    type: "function",
  },
  {
    inputs: [],
    name: "accept_governance",
    outputs: [],
    type: "function",
  },
  {
    data: [
      {
        name: "implementation_hash",
        type: "felt",
      },
      {
        name: "eic_hash",
        type: "felt",
      },
      {
        name: "init_vector_len",
        type: "felt",
      },
      {
        name: "init_vector",
        type: "felt*",
      },
      {
        name: "final",
        type: "felt",
      },
    ],
    keys: [],
    name: "implementation_added",
    type: "event",
  },
  {
    data: [
      {
        name: "implementation_hash",
        type: "felt",
      },
      {
        name: "eic_hash",
        type: "felt",
      },
      {
        name: "init_vector_len",
        type: "felt",
      },
      {
        name: "init_vector",
        type: "felt*",
      },
      {
        name: "final",
        type: "felt",
      },
    ],
    keys: [],
    name: "implementation_removed",
    type: "event",
  },
  {
    data: [
      {
        name: "implementation_hash",
        type: "felt",
      },
      {
        name: "eic_hash",
        type: "felt",
      },
      {
        name: "init_vector_len",
        type: "felt",
      },
      {
        name: "init_vector",
        type: "felt*",
      },
    ],
    keys: [],
    name: "implementation_upgraded",
    type: "event",
  },
  {
    data: [
      {
        name: "implementation_hash",
        type: "felt",
      },
    ],
    keys: [],
    name: "implementation_finalized",
    type: "event",
  },
  {
    inputs: [],
    name: "implementation",
    outputs: [
      {
        name: "implementation_hash_",
        type: "felt",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "get_upgrade_delay",
    outputs: [
      {
        name: "delay_seconds",
        type: "felt",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        name: "implementation_hash_",
        type: "felt",
      },
      {
        name: "eic_hash",
        type: "felt",
      },
      {
        name: "init_vector_len",
        type: "felt",
      },
      {
        name: "init_vector",
        type: "felt*",
      },
      {
        name: "final",
        type: "felt",
      },
    ],
    name: "implementation_time",
    outputs: [
      {
        name: "time",
        type: "felt",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        name: "implementation_hash_",
        type: "felt",
      },
      {
        name: "eic_hash",
        type: "felt",
      },
      {
        name: "init_vector_len",
        type: "felt",
      },
      {
        name: "init_vector",
        type: "felt*",
      },
      {
        name: "final",
        type: "felt",
      },
    ],
    name: "add_implementation",
    outputs: [],
    type: "function",
  },
  {
    inputs: [
      {
        name: "implementation_hash_",
        type: "felt",
      },
      {
        name: "eic_hash",
        type: "felt",
      },
      {
        name: "init_vector_len",
        type: "felt",
      },
      {
        name: "init_vector",
        type: "felt*",
      },
      {
        name: "final",
        type: "felt",
      },
    ],
    name: "remove_implementation",
    outputs: [],
    type: "function",
  },
  {
    inputs: [
      {
        name: "implementation_hash_",
        type: "felt",
      },
      {
        name: "eic_hash",
        type: "felt",
      },
      {
        name: "init_vector_len",
        type: "felt",
      },
      {
        name: "init_vector",
        type: "felt*",
      },
      {
        name: "final",
        type: "felt",
      },
    ],
    name: "upgrade_to",
    outputs: [],
    type: "function",
  },
  {
    inputs: [
      {
        name: "init_vector_len",
        type: "felt",
      },
      {
        name: "init_vector",
        type: "felt*",
      },
    ],
    name: "initialize",
    outputs: [],
    type: "function",
  },
  {
    inputs: [
      {
        name: "upgrade_delay_seconds",
        type: "felt",
      },
    ],
    name: "constructor",
    outputs: [],
    type: "constructor",
  },
  {
    inputs: [
      {
        name: "selector",
        type: "felt",
      },
      {
        name: "calldata_size",
        type: "felt",
      },
      {
        name: "calldata",
        type: "felt*",
      },
    ],
    name: "__default__",
    outputs: [
      {
        name: "retdata_size",
        type: "felt",
      },
      {
        name: "retdata",
        type: "felt*",
      },
    ],
    type: "function",
  },
  {
    inputs: [
      {
        name: "selector",
        type: "felt",
      },
      {
        name: "calldata_size",
        type: "felt",
      },
      {
        name: "calldata",
        type: "felt*",
      },
    ],
    name: "__l1_default__",
    outputs: [],
    type: "l1_handler",
  },
];

export const abi: Abi=[
  {
    "type": "impl",
    "name": "TicTacToeImpl",
    "interface_name": "tictactoe::ITicTacToe"
  },
  {
    "type": "struct",
    "name": "core::integer::u256",
    "members": [
      {
        "name": "low",
        "type": "core::integer::u128"
      },
      {
        "name": "high",
        "type": "core::integer::u128"
      }
    ]
  },
  {
    "type": "enum",
    "name": "core::bool",
    "variants": [
      {
        "name": "False",
        "type": "()"
      },
      {
        "name": "True",
        "type": "()"
      }
    ]
  },
  {
    "type": "enum",
    "name": "tictactoe::GameOutcome",
    "variants": [
      {
        "name": "InProgress",
        "type": "()"
      },
      {
        "name": "PlayerWon",
        "type": "()"
      },
      {
        "name": "ComputerWon",
        "type": "()"
      },
      {
        "name": "Tie",
        "type": "()"
      }
    ]
  },
  {
    "type": "struct",
    "name": "tictactoe::GameState",
    "members": [
      {
        "name": "player",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "winner",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "bet",
        "type": "core::integer::u256"
      },
      {
        "name": "moves_made",
        "type": "core::integer::u8"
      },
      {
        "name": "is_player_turn",
        "type": "core::bool"
      },
      {
        "name": "outcome",
        "type": "tictactoe::GameOutcome"
      }
    ]
  },
  {
    "type": "interface",
    "name": "tictactoe::ITicTacToe",
    "items": [
      {
        "type": "function",
        "name": "start_game",
        "inputs": [
          {
            "name": "bet",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "update_winner",
        "inputs": [
          {
            "name": "id",
            "type": "core::integer::u32"
          },
          {
            "name": "winner",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "play_move",
        "inputs": [
          {
            "name": "id",
            "type": "core::integer::u32"
          },
          {
            "name": "x",
            "type": "core::integer::u8"
          },
          {
            "name": "y",
            "type": "core::integer::u8"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_game_state",
        "inputs": [
          {
            "name": "id",
            "type": "core::integer::u32"
          }
        ],
        "outputs": [
          {
            "type": "tictactoe::GameState"
          }
        ],
        "state_mutability": "view"
      }
    ]
  },
  {
    "type": "event",
    "name": "tictactoe::TicTacToe::GameStarted",
    "kind": "struct",
    "members": [
      {
        "name": "game_id",
        "type": "core::integer::u32",
        "kind": "data"
      },
      {
        "name": "player",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "bet",
        "type": "core::integer::u256",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "tictactoe::TicTacToe::PlayerMoved",
    "kind": "struct",
    "members": [
      {
        "name": "game_id",
        "type": "core::integer::u32",
        "kind": "data"
      },
      {
        "name": "player",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "x",
        "type": "core::integer::u8",
        "kind": "data"
      },
      {
        "name": "y",
        "type": "core::integer::u8",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "tictactoe::TicTacToe::ComputerMoved",
    "kind": "struct",
    "members": [
      {
        "name": "game_id",
        "type": "core::integer::u32",
        "kind": "data"
      },
      {
        "name": "x",
        "type": "core::integer::u8",
        "kind": "data"
      },
      {
        "name": "y",
        "type": "core::integer::u8",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "tictactoe::TicTacToe::GameFinished",
    "kind": "struct",
    "members": [
      {
        "name": "game_id",
        "type": "core::integer::u32",
        "kind": "data"
      },
      {
        "name": "winner",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "bet_amount",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "outcome",
        "type": "tictactoe::GameOutcome",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "tictactoe::TicTacToe::Event",
    "kind": "enum",
    "variants": [
      {
        "name": "GameStarted",
        "type": "tictactoe::TicTacToe::GameStarted",
        "kind": "nested"
      },
      {
        "name": "PlayerMoved",
        "type": "tictactoe::TicTacToe::PlayerMoved",
        "kind": "nested"
      },
      {
        "name": "ComputerMoved",
        "type": "tictactoe::TicTacToe::ComputerMoved",
        "kind": "nested"
      },
      {
        "name": "GameFinished",
        "type": "tictactoe::TicTacToe::GameFinished",
        "kind": "nested"
      }
    ]
  }
]





