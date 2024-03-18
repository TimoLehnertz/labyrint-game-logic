/**
 * @author Timo lehnertz
 */
import { GameState } from "./GameState";
import { Move } from "./Move";

/**
 * Player class representing a player
 */
export interface Player {
  yourTurn: (gameState: GameState) => Promise<Move>;
}
