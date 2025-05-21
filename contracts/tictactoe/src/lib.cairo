#[derive(Copy, Drop, Serde, starknet::Store, PartialEq)]
#[allow(starknet::store_no_default_variant)]
enum GameOutcome {
    InProgress,
    PlayerWon,
    ComputerWon,
    Tie
}

#[starknet::interface]
pub trait ITicTacToe<TContractState> {
    fn start_game(ref self: TContractState, bet: u256);
    fn update_winner(ref self: TContractState, id: u32, winner: starknet::ContractAddress);
    fn play_move(ref self: TContractState, id: u32, x: u8, y: u8);
    fn get_game_state(self: @TContractState, id: u32) -> GameState;
}

#[derive(Copy, Drop, Serde, starknet::Store)]
struct GameState {
    player: starknet::ContractAddress,
    winner: starknet::ContractAddress,
    bet: u256,
    moves_made: u8,
    is_player_turn: bool,
    outcome: GameOutcome,  // Added game outcome field
}

#[starknet::contract]
mod TicTacToe {
    use core::panic_with_felt252;
    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    use starknet::storage::{
        Map, StoragePathEntry, StoragePointerReadAccess, StoragePointerWriteAccess,
    };
    use starknet::{ContractAddress, get_block_timestamp, get_caller_address, get_contract_address};
    use super::{GameState, GameOutcome};

    #[storage]
    struct Storage {
        balance: u256,
        games_len: u32,
        player: Map<u32, ContractAddress>,
        winner: Map<u32, ContractAddress>,
        bets: Map<u32, u256>,
        board: Map<u64, u8>,
        turn: Map<u32, u8>,
        moves_made: Map<u32, u8>,
        outcome: Map<u32, GameOutcome>,  // Added outcome storage
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        GameStarted: GameStarted,
        PlayerMoved: PlayerMoved,
        ComputerMoved: ComputerMoved,
        GameFinished: GameFinished,
    }

    #[derive(Drop, starknet::Event)]
    struct GameStarted {
        game_id: u32,
        player: ContractAddress,
        bet: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct PlayerMoved {
        game_id: u32,
        player: ContractAddress,
        x: u8,
        y: u8,
    }

    #[derive(Drop, starknet::Event)]
    struct ComputerMoved {
        game_id: u32,
        x: u8,
        y: u8,
    }

    #[derive(Drop, starknet::Event)]
    struct GameFinished {
        game_id: u32,
        winner: ContractAddress,
        bet_amount: u256,
        outcome: GameOutcome,  // Added outcome to event
    }

    #[abi(embed_v0)]
    impl TicTacToeImpl of super::ITicTacToe<ContractState> {
        fn start_game(ref self: ContractState, bet: u256) {
            let caller = get_caller_address();
            let game_id = self._start(bet);
            self._increase_balance(bet, game_id);

            // Emit event for game started
            self.emit(GameStarted { game_id, player: caller, bet });
        }

        fn update_winner(ref self: ContractState, id: u32, winner: ContractAddress) {
            let caller = get_caller_address();
            let player = self.player.entry(id).read();

            assert(caller == player, 'You are not the player');
            
            // Set the winner
            self.winner.entry(id).write(winner);
            
            // Determine and set the outcome
            let zero_address: ContractAddress = 0.try_into().unwrap();
            
            let current_outcome = if winner == player {
                GameOutcome::PlayerWon
            } else if winner == zero_address && self.moves_made.entry(id).read() == 9 {
                GameOutcome::Tie
            } else if winner == zero_address {
                GameOutcome::ComputerWon
            } else {
                GameOutcome::InProgress // shouldn't reach here
            };
            
            self.outcome.entry(id).write(current_outcome);
            self._payout(id);

            // Emit game finished event with outcome
            self.emit(
                GameFinished {
                    game_id: id, 
                    winner: winner, 
                    bet_amount: self.bets.entry(id).read(),
                    outcome: current_outcome,
                },
            );
        }

        fn play_move(ref self: ContractState, id: u32, x: u8, y: u8) {
            assert(x < 3 && y < 3, 'Invalid move');
            let caller = get_caller_address();
            let player = self.player.entry(id).read();

            assert(caller == player, 'You are not the player');

            let current_turn = self.turn.entry(id).read();
            assert(current_turn % 2 == 0, 'Not your turn');

            let x_u64: u64 = x.into();
            let y_u64: u64 = y.into();
            let id_u64: u64 = id.into();
            let key = id_u64 * 9 + (x_u64 * 3 + y_u64);

            assert(self.board.entry(key).read() == 0, 'Cell already played');

            // Player is marker 1
            self.board.entry(key).write(1);
            self.moves_made.entry(id).write(self.moves_made.entry(id).read() + 1);
            self.turn.entry(id).write(current_turn + 1);

            // Emit player move event
            self.emit(PlayerMoved { game_id: id, player: caller, x, y });

            // Check if player won
            if self._check_winner(id, 1) {
                self.update_winner(id, caller);
                return;
            } else if self.moves_made.entry(id).read() == 9 {
                // Game is draw - use address 0 but mark as Tie
                let zero_address: ContractAddress = 0.try_into().unwrap();
                self.winner.entry(id).write(zero_address);
                self.outcome.entry(id).write(GameOutcome::Tie);
                self._payout(id);
                
                // Emit game finished event
                self.emit(
                    GameFinished {
                        game_id: id, 
                        winner: zero_address, 
                        bet_amount: self.bets.entry(id).read(),
                        outcome: GameOutcome::Tie,
                    },
                );
                return;
            }

            // Computer move (marker 2)
            let (computer_x, computer_y) = self._make_computer_move(id);
            let computer_x_u64: u64 = computer_x.into();
            let computer_y_u64: u64 = computer_y.into();
            let computer_key = id_u64 * 9 + (computer_x_u64 * 3 + computer_y_u64);

            self.board.entry(computer_key).write(2);
            self.moves_made.entry(id).write(self.moves_made.entry(id).read() + 1);
            self.turn.entry(id).write(current_turn + 2); // Increment by 2 to keep player's turn even

            // Emit computer move event
            self.emit(ComputerMoved { game_id: id, x: computer_x, y: computer_y });

            // Check if computer won
            if self._check_winner(id, 2) {
                // Computer wins (address 0 but marked as ComputerWon)
                let zero_address: ContractAddress = 0.try_into().unwrap();
                self.winner.entry(id).write(zero_address);
                self.outcome.entry(id).write(GameOutcome::ComputerWon);
                self._payout(id);
                
                // Emit game finished event
                self.emit(
                    GameFinished {
                        game_id: id, 
                        winner: zero_address, 
                        bet_amount: self.bets.entry(id).read(),
                        outcome: GameOutcome::ComputerWon,
                    },
                );
                return;
            } else if self.moves_made.entry(id).read() == 9 {
                // Game is draw
                let zero_address: ContractAddress = 0.try_into().unwrap();
                self.winner.entry(id).write(zero_address);
                self.outcome.entry(id).write(GameOutcome::Tie);
                self._payout(id);
                
                // Emit game finished event
                self.emit(
                    GameFinished {
                        game_id: id, 
                        winner: zero_address, 
                        bet_amount: self.bets.entry(id).read(),
                        outcome: GameOutcome::Tie,
                    },
                );
                return;
            }
        }

        fn get_game_state(self: @ContractState, id: u32) -> GameState {
            let player = self.player.entry(id).read();
            let winner = self.winner.entry(id).read();
            let bet = self.bets.entry(id).read();
            let moves_made = self.moves_made.entry(id).read();
            let current_turn = self.turn.entry(id).read();
            let outcome = self.outcome.entry(id).read();

            GameState { 
                player, 
                winner, 
                bet, 
                moves_made, 
                is_player_turn: current_turn % 2 == 0,
                outcome,
            }
        }
    }

    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {
        fn _start(ref self: ContractState, bet: u256) -> u32 {
            let caller = get_caller_address();
            let game_id = self.games_len.read();
            
            self.player.entry(game_id).write(caller);
            self.games_len.write(game_id + 1);
            self.turn.entry(game_id).write(0); // start with user
            self.outcome.entry(game_id).write(GameOutcome::InProgress);
            
            game_id
        }

        fn _increase_balance(ref self: ContractState, amount: u256, id: u32) {
            assert(amount != 0, 'Amount cannot be 0');

            let strk_addr: ContractAddress =
                0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d
                .try_into()
                .unwrap();

            let strk_dispatcher = IERC20Dispatcher { contract_address: strk_addr };

            let caller = get_caller_address();
            let contract_address = get_contract_address();

            let allowance = strk_dispatcher.allowance(caller, contract_address);
            assert(allowance >= amount, 'Not enough allowance');

            strk_dispatcher.transfer_from(caller, contract_address, amount);

            // Update the contract's balance and the bet amount
            self.balance.write(self.balance.read() + amount);
            self.bets.entry(id).write(self.bets.entry(id).read() + amount);
        }

        fn _decrease_balance(ref self: ContractState, amount: u256) {
            assert(amount != 0, 'Amount cannot be 0');
            self.balance.write(self.balance.read() - amount);
        }

        fn _payout(ref self: ContractState, id: u32) {
            let rewardee = self.winner.entry(id).read();
            let zero_address: ContractAddress = 0.try_into().unwrap();
            let outcome = self.outcome.entry(id).read();

            // Check if it's a player win - only payout in this case
            if outcome == GameOutcome::PlayerWon && rewardee != zero_address {
                let strk_addr: ContractAddress =
                    0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d
                    .try_into()
                    .unwrap();

                let strk_dispatcher = IERC20Dispatcher { contract_address: strk_addr };
                strk_dispatcher.transfer(rewardee, self.bets.entry(id).read());

                self._decrease_balance(self.bets.entry(id).read());
            }
            // For computer wins or ties, no payout (house keeps the bet)
        }

        fn _check_winner(ref self: ContractState, id: u32, marker: u8) -> bool {
            let id_u64: u64 = id.into();
            let mut win: bool = false;

            let mut i: u32 = 0;
            while i < 8 {
                let (x1, y1, x2, y2, x3, y3): (u8, u8, u8, u8, u8, u8) = match i {
                    0 => (0, 0, 0, 1, 0, 2), // first row
                    1 => (1, 0, 1, 1, 1, 2), // second row
                    2 => (2, 0, 2, 1, 2, 2), // third row
                    3 => (0, 0, 1, 0, 2, 0), // first column
                    4 => (0, 1, 1, 1, 2, 1), // second column
                    5 => (0, 2, 1, 2, 2, 2), // third column
                    6 => (0, 0, 1, 1, 2, 2), // diagonal
                    7 => (0, 2, 1, 1, 2, 0), // other diagonal
                    _ => panic_with_felt252(99),
                };

                let k1: u64 = id_u64 * 9 + (x1.into() * 3 + y1.into());
                let k2: u64 = id_u64 * 9 + (x2.into() * 3 + y2.into());
                let k3: u64 = id_u64 * 9 + (x3.into() * 3 + y3.into());

                if self.board.entry(k1).read() == marker
                    && self.board.entry(k2).read() == marker
                    && self.board.entry(k3).read() == marker {
                    win = true;
                    break;
                }

                i += 1;
            }

            win
        }

        fn _make_computer_move(ref self: ContractState, id: u32) -> (u8, u8) {
            let id_u64: u64 = id.into();

            // Simple strategy for computer:
            // 1. Try to win
            // 2. Block player from winning
            // 3. Play center if available
            // 4. Play corner if available
            // 5. Play any available spot

            // Check if computer can win
            let possible_win = self._find_winning_move(id, 2);
            if possible_win.is_some() {
                let (x, y) = possible_win.unwrap();
                return (x, y);
            }

            // Block player from winning
            let possible_block = self._find_winning_move(id, 1);
            if possible_block.is_some() {
                let (x, y) = possible_block.unwrap();
                return (x, y);
            }

            // Play center if available
            let center_key = id_u64 * 9 + (1_u64 * 3 + 1_u64);
            if self.board.entry(center_key).read() == 0 {
                return (1, 1);
            }

            // Play corner if available
            let corners = array![(0, 0), (0, 2), (2, 0), (2, 2)];
            let mut i = 0;

            // Use timestamp as pseudo-random seed
            let timestamp = get_block_timestamp();
            let start_index = (timestamp % 4).try_into().unwrap();

            while i < 4 {
                let idx = (start_index + i) % 4;
                let (x, y) = *corners.at(idx);
                let corner_key = id_u64 * 9 + (x.into() * 3 + y.into());
                if self.board.entry(corner_key).read() == 0 {
                    return (x, y);
                }
                i += 1;
            }

            // Play any available spot
            let mut x = 0;
            while x < 3 {
                let mut y = 0;
                while y < 3 {
                    let key = id_u64 * 9 + (x.into() * 3 + y.into());
                    if self.board.entry(key).read() == 0 {
                        return (x, y);
                    }
                    y += 1;
                }
                x += 1;
            }

            // Should never reach here if board validation is correct
            panic_with_felt252('No valid moves available');
            return (0_u8, 0_u8);
        }

        fn _find_winning_move(ref self: ContractState, id: u32, marker: u8) -> Option<(u8, u8)> {
            let id_u64: u64 = id.into();

            // Check all possible winning lines
            let mut i: u32 = 0;
            while i < 8 {
                let (x1, y1, x2, y2, x3, y3): (u8, u8, u8, u8, u8, u8) = match i {
                    0 => (0, 0, 0, 1, 0, 2), // first row
                    1 => (1, 0, 1, 1, 1, 2), // second row
                    2 => (2, 0, 2, 1, 2, 2), // third row
                    3 => (0, 0, 1, 0, 2, 0), // first column
                    4 => (0, 1, 1, 1, 2, 1), // second column
                    5 => (0, 2, 1, 2, 2, 2), // third column
                    6 => (0, 0, 1, 1, 2, 2), // diagonal
                    7 => (0, 2, 1, 1, 2, 0), // other diagonal
                    _ => panic_with_felt252(99),
                };

                let k1: u64 = id_u64 * 9 + (x1.into() * 3 + y1.into());
                let k2: u64 = id_u64 * 9 + (x2.into() * 3 + y2.into());
                let k3: u64 = id_u64 * 9 + (x3.into() * 3 + y3.into());

                let val1 = self.board.entry(k1).read();
                let val2 = self.board.entry(k2).read();
                let val3 = self.board.entry(k3).read();

                // Check if we can win in this line
                if (val1 == marker && val2 == marker && val3 == 0) {
                    return Option::Some((x3, y3));
                }
                if (val1 == marker && val3 == marker && val2 == 0) {
                    return Option::Some((x2, y2));
                }
                if (val2 == marker && val3 == marker && val1 == 0) {
                    return Option::Some((x1, y1));
                }

                i += 1;
            }

            // No winning move found
            return Option::None;
        }
    }
}