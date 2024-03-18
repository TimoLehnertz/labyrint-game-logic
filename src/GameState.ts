/**
 * @author Timo lehnertz
 */
import { AllPlayerStates } from "./AllPlayerStates";
import { Board } from "./Board";
import { BoardPosition } from "./BoardPosition";
import { ShiftPosition } from "./ShiftPosition";
import { Move } from "./Move";
import { PlayerState } from "./PlayerState";
import { Treasure } from "./Treasure";

/**
 * Gamestate class representing the state of a game
 * This class exposes all information about the game that a player could legally know by looking at the board
 */
export class GameState {
  public readonly board: Board;
  public readonly allPlayerStates: AllPlayerStates;

  public constructor(board: Board, allPlayerStates: AllPlayerStates) {
    this.board = board;
    this.allPlayerStates = allPlayerStates;
  }

  public isMoveLegal(move: Move): boolean {
    if (!this.board.isShiftPositionValid(move.shiftPosition)) {
      return false;
    }
    const gameStatedAfterSlide = this.insertTile(move.shiftPosition);
    const playerState = gameStatedAfterSlide.allPlayerStates.getPlayerState(
      move.playerIndex
    );
    if (playerState === null) {
      return false; // invalid player color
    }
    if (move.from !== playerState.position) {
      return false; // invalid starting position
    }
    if (!gameStatedAfterSlide.board.isReachable(move.from, move.to)) {
      return false;
    }
    let expectedTreasure = null;
    const treasureAtTo = gameStatedAfterSlide.board.getTile(move.to).treasure;
    if (treasureAtTo !== null) {
      if (playerState.currentTreasure?.equals(treasureAtTo)) {
        expectedTreasure = treasureAtTo;
      }
    }
    if (expectedTreasure !== move.collectedTreasure) {
      return false;
    }
    return true;
  }

  /**
   * Does not check if the move is legal
   * @param move The LEGAL move to move
   * @returns a modified version of this board
   */
  public move(move: Move): GameState {
    return this.rotateLooseTile(move.rotateBeforeShift)
      .insertTile(move.shiftPosition)
      .movePlayer(move.playerIndex, move.to)
      .collectTreasure(move.playerIndex, move.collectedTreasure);
  }

  /**
   * Does not check if the move is legal
   * @param move The LEGAL move to undo
   * @returns a modified version of this board
   */
  public undoMove(move: Move): GameState {
    return this.removeLastTreasure(move.playerIndex, move.collectedTreasure)
      .movePlayer(move.playerIndex, move.from)
      .insertTile(this.board.invertShiftPosition(move.shiftPosition))
      .rotateLooseTile(-move.rotateBeforeShift);
  }

  private rotateLooseTile(rotateBeforeShift: number): GameState {
    return new GameState(
      this.board.rotateLooseTile(rotateBeforeShift),
      this.allPlayerStates
    );
  }

  private insertTile(shiftPosition: ShiftPosition): GameState {
    const firstMovedTilePosition =
      this.board.getFirstMovedTilePosition(shiftPosition);
    const lastMovedTilePosition =
      this.board.getLastMovedTilePosition(shiftPosition);

    const newAllPlayerStates = this.allPlayerStates.mutateAll(
      (playerState: PlayerState): PlayerState => {
        if (playerState.position.equals(lastMovedTilePosition)) {
          return playerState.setPosition(firstMovedTilePosition);
        } else {
          return playerState;
        }
      }
    );

    const newBoard = this.board.shift(shiftPosition);

    return new GameState(newBoard, newAllPlayerStates);
  }

  private movePlayer(playerIndex: number, to: BoardPosition) {
    const newAllPlayerStates = this.allPlayerStates.movePlayer(playerIndex, to);
    return new GameState(this.board, newAllPlayerStates);
  }

  private collectTreasure(
    playerIndex: number,
    foundTreasure: Treasure | null
  ): GameState {
    if (foundTreasure === null) {
      return this;
    }
    const newAllPlayerStates = this.allPlayerStates.collectTreasure(
      playerIndex,
      foundTreasure
    );
    return new GameState(this.board, newAllPlayerStates);
  }

  private removeLastTreasure(
    playerIndex: number,
    foundTreasure: Treasure | null
  ): GameState {
    if (foundTreasure === null) {
      return this;
    }
    const newAllPlayerStates =
      this.allPlayerStates.removeLastTreasure(playerIndex);
    return new GameState(this.board, newAllPlayerStates);
  }
}
