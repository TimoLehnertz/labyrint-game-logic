/**
 * @author Timo lehnertz
 */

import { GameState } from "./GameState";

/**
 * Game class representing a game
 */
export class Game {
  private gameState: GameState;

  private constructor(gameState: GameState) {
    this.gameState = gameState;
  }
}
