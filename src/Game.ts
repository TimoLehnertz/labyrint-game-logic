/**
 * @author Timo lehnertz
 */
import { AllPlayerStates } from "./AllPlayerStates";
import { Board } from "./Board";
import { GameState } from "./GameState";
import { Move } from "./Move";
import { PathTile, TileType } from "./PathTile";
import { PlayerState } from "./PlayerState";
import { RandomNumberGenerator } from "./RandomNumberGenerator";
import { Treasure } from "./Treasure";

export interface GameSetup {
  seed: string;
  boardWidth?: number;
  boardHeight?: number;
  playerCount: number;
}

export interface PlayerListener {
  yourTurn: (gameState: GameState, move: (move: Move) => boolean) => void;
}

export interface WinListener {
  gameEnded: (winnerIndex: number) => void;
}

/**
 * Game class representing a game
 */
export class Game {
  // Game state
  private _gameState: GameState;
  private gameEnded: boolean;
  // stuff
  private redoHistory: Move[] = [];
  private playerListeners: PlayerListener[][] = [];
  private winListeners: WinListener[] = [];

  private constructor(gameState: GameState, gameEnded: boolean) {
    this._gameState = gameState;
    this.gameEnded = gameEnded;
  }

  /**
   * Game Logic -------------------
   */

  public move(move: Move): boolean {
    if (this.redoHistory.length > 0) {
      return false;
    }
    if (this.gameEnded) {
      return false;
    }
    if (!this._gameState.isMoveLegal(move)) {
      return false;
    }
    this._gameState = this._gameState.move(move);
    this.redoHistory = [];
    const winner = this._gameState.getWinnerIndex();
    if (winner !== null) {
      for (const winListener of this.winListeners) {
        winListener.gameEnded(winner);
      }
      this.gameEnded = true;
    } else {
      // next palyers turn
      const playerListeners =
        this.playerListeners[this._gameState.allPlayerStates.playerIndexToMove];
      if (playerListeners) {
        for (const playerListener of playerListeners) {
          playerListener.yourTurn(this._gameState, (move: Move) =>
            this.move(move)
          );
        }
      }
    }
    return true;
  }

  public undoLastMove(): boolean {
    const result = this._gameState.undoMove();
    this._gameState = result.newGameState;
    if (result.undoneMove === null) {
      return false;
    }
    this.redoHistory.push(result.undoneMove);
    return true;
  }

  public redoLastMove(): boolean {
    const redoMove = this.redoHistory.pop();
    if (redoMove === undefined) {
      return false;
    }
    this._gameState = this._gameState.move(redoMove);
    return true;
  }

  public addPlayerListener(
    playerIndex: number,
    playerListener: PlayerListener
  ): void {
    if (typeof this.playerListeners[playerIndex] === undefined) {
      this.playerListeners[playerIndex] = [];
    }
    this.playerListeners[playerIndex].push(playerListener);
  }

  public addWinListener(winListener: WinListener): void {
    this.winListeners.push(winListener);
  }

  public get gameState(): GameState {
    return this._gameState;
  }

  /**
   * Setup logic
   */
  public static buildFromSetup(setup: GameSetup): Game {
    const boardWidth = setup.boardWidth ?? 7;
    const boardHeight = setup.boardHeight ?? 7;
    if (!Board.isSizeValid(boardWidth) || !Board.isSizeValid(boardHeight)) {
      throw new Error(`Invalid board size`);
    }
    const maxPlayers = Board.getMaxPlayerCount(boardWidth, boardHeight);
    if (setup.playerCount > maxPlayers) {
      throw new Error(`Too many players. Max ${maxPlayers}`);
    }
    if (setup.playerCount < 2) {
      throw new Error("Too few players. Min 2");
    }
    const generator = new RandomNumberGenerator(setup.seed);
    const treasures = Game.generateTreasures(
      Game.getTreasureCount(setup.playerCount)
    );
    const allPlayerStates = Game.generatePlayerStates(
      generator,
      setup.playerCount,
      treasures,
      boardWidth,
      boardHeight
    );
    const board = Game.generateRandomBoard(
      generator,
      treasures,
      boardWidth,
      boardHeight
    );
    const gameState = new GameState(board, allPlayerStates, []);
    return new Game(gameState, false);
  }

  private static getTreasureCount(playerCount: number): number {
    if (playerCount <= 4) {
      return 24;
    } else {
      return playerCount * 6;
    }
  }

  private static generateRandomBoard(
    generator: RandomNumberGenerator,
    treasures: Treasure[],
    width: number,
    height: number
  ) {
    // create board tile placeholders
    const tiles: (PathTile | null)[][] = [];
    for (let x = 0; x < width; x++) {
      const column: (PathTile | null)[] = [];
      for (let y = 0; y < height; y++) {
        column[y] = null;
      }
      tiles.push(column);
    }
    // fill corners
    tiles[0][0] = new PathTile(TileType.L, null, 0, null);
    tiles[width - 1][0] = new PathTile(TileType.L, null, 1, null);
    tiles[width - 1][height - 1] = new PathTile(TileType.L, null, 2, null);
    tiles[0][height - 1] = new PathTile(TileType.L, null, 3, null);
    // fill fix edges
    const getRandomTreasure = Game.getRandomTreasureProvider(
      generator,
      treasures
    );
    // NORTH
    for (let x = 2; x < width - 2; x += 2) {
      tiles[x][0] = new PathTile(TileType.T, getRandomTreasure(), 2, null);
    }
    // EAST
    for (let y = 2; y < height - 2; y += 2) {
      tiles[width - 1][y] = new PathTile(
        TileType.T,
        getRandomTreasure(),
        3,
        null
      );
    }
    // SOUTH
    for (let x = 2; x < width - 2; x += 2) {
      tiles[x][height - 1] = new PathTile(
        TileType.T,
        getRandomTreasure(),
        0,
        null
      );
    }
    // WEST
    for (let y = 2; y < height - 2; y += 2) {
      tiles[0][y] = new PathTile(TileType.T, getRandomTreasure(), 1, null);
    }
    // fill fix center
    for (let x = 2; x < width - 2; x += 2) {
      for (let y = 2; y < height - 2; y += 2) {
        tiles[x][y] = new PathTile(
          TileType.T,
          null,
          Math.floor(generator.rand() * 4),
          null
        );
      }
    }
    // fill remaining
    const treasureCandidates: ({ x: number; y: number } | "loose-tile")[] = [
      "loose-tile",
    ];
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (tiles[x][y] === null) {
          treasureCandidates.push({ x, y });
          tiles[x][y] = new PathTile(
            Game.generateRandomTileType(generator),
            null,
            Math.floor(generator.rand() * 4),
            null
          );
        }
      }
    }
    let looseTile = new PathTile(
      Game.generateRandomTileType(generator),
      null,
      Math.floor(generator.rand() * 4),
      null
    );
    treasureCandidates.push("loose-tile");
    // distribute remaining treasures
    let currentTreasure = getRandomTreasure();

    while (currentTreasure !== null) {
      const chosenIndex = Math.floor(
        generator.rand() * 0.999 * treasureCandidates.length
      );
      const chosenCandidate = treasureCandidates[chosenIndex];
      if (chosenCandidate === "loose-tile") {
        looseTile = looseTile.setTreasure(currentTreasure);
      } else {
        tiles[chosenCandidate.x][chosenCandidate.y] =
          tiles[chosenCandidate.x][chosenCandidate.y]?.setTreasure(
            currentTreasure
          ) ?? null;
      }
      currentTreasure = getRandomTreasure();
    }
    // set homePoints
    const homePoints = Board.generatePlayerHomePositions(width, height);
    for (let i = 0; i < homePoints.length; i++) {
      const homePoint = homePoints[i];
      tiles[homePoint.x][homePoint.y] =
        tiles[homePoint.x][homePoint.y]?.setHomeOfPlayerIndex(i) ?? null;
    }
    return new Board(tiles as PathTile[][], looseTile);
  }

  private static generateRandomTileType(
    generator: RandomNumberGenerator
  ): TileType {
    const rand = generator.rand() * 3;
    if (rand < 1) {
      return TileType.L;
    } else if (rand < 2) {
      return TileType.T;
    } else {
      return TileType.STREIGHT;
    }
  }

  private static getRandomTreasureProvider(
    generator: RandomNumberGenerator,
    treasures: Treasure[]
  ): () => Treasure | null {
    const remainingTreasures: Treasure[] = [];
    for (const treasure of treasures) {
      remainingTreasures.push(treasure);
    }
    function getRandomTreasure(): Treasure | null {
      const rand = generator.rand();
      const index = Math.floor(
        Math.min(0.99, rand) * remainingTreasures.length
      );
      if (index < remainingTreasures.length) {
        return null;
      }
      const randomTreasure = remainingTreasures[index];
      remainingTreasures.splice(index, 1);
      return randomTreasure;
    }
    return getRandomTreasure;
  }

  /**
   * @param numberOfPlayers Has to be either 2, 3 or 4
   */
  private static generatePlayerStates(
    generator: RandomNumberGenerator,
    numberOfPlayers: number,
    treasures: Treasure[],
    boardWidth: number,
    boardHeight: number
  ): AllPlayerStates {
    // generate treasures
    const getRandomTreasure = Game.getRandomTreasureProvider(
      generator,
      treasures
    );
    // distribute all treasures evenly to all players
    const allPlayersTreasures: Treasure[][] = [];
    for (let i = 0; i < numberOfPlayers; i++) {
      const playerTreasures: Treasure[] = [];
      for (let i = 0; i < 26 / numberOfPlayers; i++) {
        const treasure = getRandomTreasure();
        if (treasure) {
          playerTreasures.push();
        }
      }
      allPlayersTreasures.push(playerTreasures);
    }
    // create playerStates
    const playerStates: PlayerState[] = [];
    for (let i = 0; i < allPlayersTreasures.length; i++) {
      const playersTreasures = allPlayersTreasures[i];
      const currentTreasure = playersTreasures.pop() ?? null;
      const playerStartPosition = Board.getPlayerHomePosition(
        i,
        boardWidth,
        boardHeight
      );
      playerStates.push(
        new PlayerState(
          [],
          playersTreasures,
          currentTreasure,
          playerStartPosition
        )
      );
    }
    return new AllPlayerStates(playerStates, 0);
  }

  private static generateTreasures(amount: number): Treasure[] {
    const treasures = [];
    for (let i = 0; i < amount; i++) {
      treasures.push(new Treasure(i));
    }
    return treasures;
  }

  public static buildFromString(str: string): Game {
    const obj = JSON.parse(str);
    if (!("gameState" in obj) || !("gameEnded" in obj)) {
      throw new Error("Invalid game string");
    }
    return new Game(obj.gameState, obj.gameEnded);
  }

  public stringify(): string {
    const obj = {
      gameState: this._gameState,
      gameEnded: this.gameEnded,
    };
    return JSON.stringify(obj);
  }
}
