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
import { Cyrb64 } from "./Cyrb64";

/**
 * GameState class representing the state of a game
 * This class exposes all information about the game that a player could legally know by looking at the board
 */
export class GameState {
  public readonly board: Board;
  public readonly allPlayerStates: AllPlayerStates;
  public readonly historyMoves: Move[];
  private hashCache: Cyrb64 | null = null;

  public constructor(
    board: Board,
    allPlayerStates: AllPlayerStates,
    historyMoves: Move[]
  ) {
    this.board = board;
    this.allPlayerStates = allPlayerStates;
    this.historyMoves = historyMoves;
  }

  /**
   * @throws Error in case the move is not valid
   */
  public validateMove(move: Move) {
    if (
      !this.board.isShiftPositionValid(move.fromShiftPosition) ||
      !this.board.isShiftPositionValid(move.toShiftPosition)
    ) {
      throw new Error("Invalid shift position");
    }
    if (!this.board.shiftPosition.equals(move.fromShiftPosition)) {
      throw new Error("Invalid starting shiftPosition");
    }
    const gameStatedAfterSlide = this.setShiftPosition(
      move.toShiftPosition
    ).insertLooseTile();
    const playerState = gameStatedAfterSlide.allPlayerStates.getPlayerState(
      move.playerIndex
    );
    if (playerState === null) {
      throw new Error("Invalid playerIndex");
    }
    if (!move.from.equals(playerState.position)) {
      console.log(move.from, playerState.position);
      throw new Error("Invalid starting position");
    }
    if (!gameStatedAfterSlide.board.isReachable(move.from, move.to)) {
      throw new Error("Destination is not in reach");
    }
    let expectedTreasure: Treasure | null = null;
    const treasureAtTo = gameStatedAfterSlide.board.getTile(move.to).treasure;
    if (treasureAtTo !== null) {
      if (playerState.currentTreasure?.equals(treasureAtTo)) {
        expectedTreasure = treasureAtTo;
      }
    }
    if (!Treasure.compare(expectedTreasure, move.collectedTreasure)) {
      console.log(expectedTreasure, move.collectedTreasure);
      console.log(JSON.stringify(move));
      throw new Error("Invalid collected treasure");
    }
  }

  /**
   * @throws Error in case the move is not valid
   */
  public move(move: Move): GameState {
    this.validateMove(move);
    return this.rotateLooseTile(move.rotateBeforeShift)
      .setShiftPosition(move.toShiftPosition)
      .insertLooseTile()
      .movePlayer(move.playerIndex, move.to)
      .collectTreasure(move.playerIndex, move.collectedTreasure)
      .nextPlayer()
      .addMoveToHistory(move);
  }

  public undoMove(): { newGameState: GameState; undoneMove: Move } {
    if (this.historyMoves.length === 0) {
      throw new Error("no moves to undo");
    }
    const move = this.historyMoves[this.historyMoves.length - 1];
    return {
      newGameState: this.removeLastHistoryMove()
        .prevPlayer()
        .removeLastTreasure(move.playerIndex, move.collectedTreasure)
        .movePlayer(move.playerIndex, move.from)
        .insertLooseTile()
        .setShiftPosition(move.fromShiftPosition)
        .rotateLooseTile(-move.rotateBeforeShift),
      undoneMove: move,
    };
  }

  public rotateLooseTile(rotateBeforeShift: number): GameState {
    return new GameState(
      this.board.rotateLooseTile(rotateBeforeShift),
      this.allPlayerStates,
      this.historyMoves
    );
  }

  public setShiftPosition(shiftPosition: ShiftPosition): GameState {
    const newBoard = this.board.setShiftPosition(shiftPosition);
    return new GameState(newBoard, this.allPlayerStates, this.historyMoves);
  }

  public insertLooseTile(): GameState {
    const newAllPlayerStates = this.allPlayerStates.mutateAll(
      (playerState: PlayerState): PlayerState => {
        return playerState.setPosition(
          this.board.shiftPosition.shiftPlayer(
            playerState.position,
            this.board.width,
            this.board.height
          )
        );
      }
    );
    const newBoard = this.board.insertLooseTile();
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
      const playerHomePoint = Board.getPlayerHomePosition(
        player.playerIndex,
        this.board.width,
        this.board.height
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
    // if (!other.hash().equals(this.hash())) {
    //   console.log(this.board.looseTile);
    //   console.log(other.board.looseTile);
    // }
    return other.hash().equals(this.hash());
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

  public hash(): Cyrb64 {
    if (this.hashCache === null) {
      this.hashCache = Cyrb64.hashString(JSON.stringify(this), 0);
    }
    return this.hashCache;
  }
}
