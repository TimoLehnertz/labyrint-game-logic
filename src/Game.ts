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

export interface CardRatios {
  lCards: number;
  streightCards: number;
  tCards: number;
}

export interface TreasureCardChances {
  lCardTreasureChance: number;
  streightCardTreasureChance: number;
  tCardTreasureChance: number;
  fixCardTreasureChance: number;
}

export interface GameSetup {
  seed: string;
  playerCount: number;
  boardWidth: number;
  boardHeight: number;
  cardsRatio: CardRatios;
  treasureCardChances: TreasureCardChances;
}

export type GameTileType = "fix" | "homePoint" | TileType;
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
  public static getDefaultSetup(): GameSetup {
    return {
      playerCount: 4,
      seed: "seed",
      boardHeight: 7,
      boardWidth: 7,
      cardsRatio: {
        lCards: 15 / 34,
        streightCards: 13 / 34,
        tCards: 6 / 34,
      },
      treasureCardChances: {
        lCardTreasureChance: 6 / 15,
        streightCardTreasureChance: 0,
        tCardTreasureChance: 1,
        fixCardTreasureChance: 1,
      },
    };
  }

  private static finalizeSetup(setup: Partial<GameSetup>): GameSetup {
    const defaultSetup = Game.getDefaultSetup();
    const finalSetup = {
      boardHeight: setup.boardHeight ?? defaultSetup.boardHeight,
      boardWidth: setup.boardWidth ?? defaultSetup.boardWidth,
      cardsRatio: setup.cardsRatio ?? defaultSetup.cardsRatio,
      playerCount: setup.playerCount ?? defaultSetup.playerCount,
      seed: setup.seed ?? defaultSetup.seed,
      treasureCardChances:
        setup.treasureCardChances ?? defaultSetup.treasureCardChances,
    };
    if (
      !Board.isSizeValid(finalSetup.boardWidth) ||
      !Board.isSizeValid(finalSetup.boardHeight)
    ) {
      throw new Error(`Invalid board size`);
    }
    const maxPlayers = Board.getMaxPlayerCount(
      finalSetup.boardWidth,
      finalSetup.boardHeight
    );
    if (finalSetup.playerCount > maxPlayers) {
      throw new Error(`Too many players. Max ${maxPlayers}`);
    }
    if (finalSetup.playerCount < 2) {
      throw new Error("Too few players. Min 2");
    }
    return finalSetup;
  }

  public static buildFromSetup(partialSetup: Partial<GameSetup>): Game {
    // apply defaults
    const setup = Game.finalizeSetup(partialSetup);
    const generator = new RandomNumberGenerator(setup.seed);
    const treasures = Game.generateTreasures(
      Game.getTreasureCount(setup.playerCount)
    );
    const allPlayerStates = Game.generatePlayerStates(
      generator,
      setup.playerCount,
      treasures,
      setup.boardWidth,
      setup.boardHeight
    );
    const board = Game.generateRandomBoard(
      generator,
      treasures,
      setup.boardWidth,
      setup.boardHeight,
      setup.cardsRatio,
      setup.treasureCardChances
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
    height: number,
    cardsRatios: CardRatios,
    treasureCardChances: TreasureCardChances
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
    // get generator
    const getRandomTreasure = Game.getRandomTreasureProvider(
      generator,
      treasures,
      treasureCardChances
    );
    const homePoints = Board.generatePlayerHomePositions(width, height);
    function isHome(x: number, y: number): boolean {
      for (const homePoint of homePoints) {
        if (homePoint.x === x && homePoint.y === y) {
          return true;
        }
      }
      return false;
    }
    //
    // fill fix edges
    // NORTH
    for (let x = 2; x < width - 2; x += 2) {
      tiles[x][0] = new PathTile(
        TileType.T,
        getRandomTreasure(isHome(x, 0) ? "homePoint" : "fix"),
        2,
        null
      );
    }
    // EAST
    for (let y = 2; y < height - 2; y += 2) {
      tiles[width - 1][y] = new PathTile(
        TileType.T,
        getRandomTreasure(isHome(width - 1, y) ? "homePoint" : "fix"),
        3,
        null
      );
    }
    // SOUTH
    for (let x = 2; x < width - 2; x += 2) {
      tiles[x][height - 1] = new PathTile(
        TileType.T,
        getRandomTreasure(isHome(x, height - 1) ? "homePoint" : "fix"),
        0,
        null
      );
    }
    // WEST
    for (let y = 2; y < height - 2; y += 2) {
      tiles[0][y] = new PathTile(
        TileType.T,
        getRandomTreasure(isHome(0, y) ? "homePoint" : "fix"),
        1,
        null
      );
    }
    // fill fix center
    for (let x = 2; x < width - 2; x += 2) {
      for (let y = 2; y < height - 2; y += 2) {
        tiles[x][y] = new PathTile(
          TileType.T,
          getRandomTreasure(isHome(x, y) ? "homePoint" : "fix"),
          Math.floor(generator.rand() * 4),
          null
        );
      }
    }
    // fill remaining
    const treasureCandidates: ({ x: number; y: number } | "loose-tile")[][] = [
      [], // T cards
      [], // L cards
      [], // Streight cards
    ];
    const tileTypes = [TileType.T, TileType.L, TileType.STREIGHT];
    function idxFromTileType(tileType: TileType): number {
      switch (tileType) {
        case TileType.T:
          return 0;
        case TileType.L:
          return 1;
        case TileType.STREIGHT:
          return 2;
      }
    }
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (tiles[x][y] === null) {
          const pathTile = new PathTile(
            Game.generateRandomTileType(generator),
            null,
            Math.floor(generator.rand() * 4),
            null
          );
          tiles[x][y] = pathTile;
          treasureCandidates[idxFromTileType(pathTile.tileType)].push({ x, y });
        }
      }
    }
    let looseTile = new PathTile(
      Game.generateRandomTileType(generator),
      null,
      Math.floor(generator.rand() * 4),
      null
    );
    treasureCandidates[idxFromTileType(looseTile.tileType)].push("loose-tile");
    // distribute remaining treasures
    for (let i = 0; i < treasureCandidates.length; i++) {
      const treasureCandidatesOfType = treasureCandidates[i];
      for (const chosenCandidate of treasureCandidatesOfType) {
        const treasure = getRandomTreasure(tileTypes[i]);
        if (chosenCandidate === "loose-tile") {
          looseTile = looseTile.setTreasure(treasure);
        } else {
          tiles[chosenCandidate.x][chosenCandidate.y] =
            tiles[chosenCandidate.x][chosenCandidate.y]?.setTreasure(
              treasure
            ) ?? null;
        }
      }
    }
    // set homePoints
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

  public static getRandomTreasureProvider(
    generator: RandomNumberGenerator,
    treasures: Treasure[],
    treasureCardChances?: TreasureCardChances
  ): (cardType?: GameTileType) => Treasure | null {
    const remainingTreasures: Treasure[] = [];
    for (const treasure of treasures) {
      remainingTreasures.push(treasure);
    }
    function getRandomTreasure(cardType?: GameTileType): Treasure | null {
      let skipChance = 0;
      if (treasureCardChances !== undefined && cardType !== undefined) {
        switch (cardType) {
          case TileType.L:
            skipChance = 1 - treasureCardChances.lCardTreasureChance;
            break;
          case TileType.T:
            skipChance = 1 - treasureCardChances.tCardTreasureChance;
            break;
          case TileType.STREIGHT:
            skipChance = 1 - treasureCardChances.streightCardTreasureChance;
            break;
          case "fix":
            skipChance = 1 - treasureCardChances.fixCardTreasureChance;
            break;
          case "homePoint":
            skipChance = 1;
            break;
        }
      }
      const rand = generator.rand();
      if (rand < skipChance) {
        return null;
      }
      const index = Math.floor(
        Math.min(0.99, rand) * remainingTreasures.length
      );
      if (index >= remainingTreasures.length) {
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

  public static generateTreasures(amount: number): Treasure[] {
    const treasures: Treasure[] = [];
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
    return new Game(GameState.create(obj.gameState), obj.gameEnded);
  }

  public stringify(): string {
    const obj = {
      gameState: this._gameState,
      gameEnded: this.gameEnded,
    };
    return JSON.stringify(obj);
  }
}
