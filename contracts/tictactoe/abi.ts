export const abi=[
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
