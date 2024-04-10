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
import { PathTile } from "./PathTile";

/**
 * Gamestate class representing the state of a game
 * This class exposes all information about the game that a player could legally know by looking at the board
 */
export class GameState {
  public readonly board: Board;
  public readonly allPlayerStates: AllPlayerStates;
  public readonly historyMoves: Move[];

  public constructor(
    board: Board,
    allPlayerStates: AllPlayerStates,
    historyMoves: Move[]
  ) {
    this.board = board;
    this.allPlayerStates = allPlayerStates;
    this.historyMoves = historyMoves;
  }

  public static create(instance: GameState): GameState {
    const historyMoves: Move[] = [];
    for (const historyMove of instance.historyMoves) {
      historyMoves.push(Move.create(historyMove));
    }
    return new GameState(
      Board.create(instance.board),
      AllPlayerStates.create(instance.allPlayerStates),
      historyMoves
    );
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
    let expectedTreasure: Treasure | null = null;
    const treasureAtTo = gameStatedAfterSlide.board.getTile(move.to).treasure;
    if (treasureAtTo !== null) {
      if (playerState.currentTreasure?.equals(treasureAtTo)) {
        expectedTreasure = treasureAtTo;
      }
    }
    if (!Treasure.compare(expectedTreasure, move.collectedTreasure)) {
      return false;
    }
    return true;
  }

  public move(move: Move): GameState {
    if (!this.isMoveLegal(move)) {
      throw new Error("Illegal move");
    }
    return this.rotateLooseTile(move.rotateBeforeShift)
      .insertTile(move.shiftPosition)
      .movePlayer(move.playerIndex, move.to)
      .collectTreasure(move.playerIndex, move.collectedTreasure)
      .nextPlayer()
      .addMoveToHistory(move);
  }

  public undoMove(): { newGameState: GameState; undoneMove: Move | null } {
    if (this.historyMoves.length === 0) {
      return {
        newGameState: this,
        undoneMove: null,
      };
    }
    const move = this.historyMoves[this.historyMoves.length - 1];
    return {
      newGameState: this.removeLastHistoryMove()
        .prevPlayer()
        .removeLastTreasure(move.playerIndex, move.collectedTreasure)
        .movePlayer(move.playerIndex, move.from)
        .insertTile(this.board.invertShiftPosition(move.shiftPosition))
        .rotateLooseTile(-move.rotateBeforeShift),
      undoneMove: move,
    };
  }

  private rotateLooseTile(rotateBeforeShift: number): GameState {
    return new GameState(
      this.board.rotateLooseTile(rotateBeforeShift),
      this.allPlayerStates,
      this.historyMoves
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

    return new GameState(newBoard, newAllPlayerStates, this.historyMoves);
  }

  private movePlayer(playerIndex: number, to: BoardPosition) {
    const newAllPlayerStates = this.allPlayerStates.movePlayer(playerIndex, to);
    return new GameState(this.board, newAllPlayerStates, this.historyMoves);
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
    return new GameState(this.board, newAllPlayerStates, this.historyMoves);
  }

  public getWinnerIndex(): number | null {
    const playerStates = this.allPlayerStates.getPlayerStatesWithAllTreasures();
    for (const player of playerStates) {
      const playerHomePoint = this.board.getPlayerHomePosition(
        player.playerIndex
      );
      if (player.playerState.position.equals(playerHomePoint)) {
        return player.playerIndex;
      }
    }
    return null;
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
    return new GameState(this.board, newAllPlayerStates, this.historyMoves);
  }

  private nextPlayer(): GameState {
    return new GameState(
      this.board,
      this.allPlayerStates.nextPlayer(),
      this.historyMoves
    );
  }

  private prevPlayer(): GameState {
    return new GameState(
      this.board,
      this.allPlayerStates.prevPlayer(),
      this.historyMoves
    );
  }

  private copyHistory(): Move[] {
    const newHistory: Move[] = [];
    for (const historyMove of this.historyMoves) {
      newHistory.push(historyMove);
    }
    return newHistory;
  }

  private addMoveToHistory(move: Move): GameState {
    const newHistory = this.copyHistory();
    newHistory.push(move);
    return new GameState(this.board, this.allPlayerStates, newHistory);
  }

  private removeLastHistoryMove(): GameState {
    const newHistory = this.copyHistory();
    newHistory.pop();
    return new GameState(this.board, this.allPlayerStates, newHistory);
  }

  public equals(other: GameState): boolean {
    // console.log(this.allPlayerStates.equals(other.allPlayerStates));
    // console.log(this.board.equals(other.board));
    return (
      this.allPlayerStates.equals(other.allPlayerStates) &&
      this.board.equals(other.board)
    );
  }
}
