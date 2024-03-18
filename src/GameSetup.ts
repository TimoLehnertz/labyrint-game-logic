import { AllPlayerStates } from "./AllPlayerStates";
import { Board } from "./Board";
import { Player } from "./Player";
import { PlayerState } from "./PlayerState";
import { RandomNumberGenerator } from "./RandomNumberGenerator";
import { PathTile, TileType } from "./PathTile";
import { Treasure } from "./Treasure";

export interface GameSetup {
  seed: string;
  boardWidth?: number;
  boardHeight?: number;
  players: Player[];
}

export class GameSetup {
  public startBoard: Board;
  public allPlayerStates: AllPlayerStates;

  private constructor(startBoard: Board, allPlayerStates: AllPlayerStates) {
    this.startBoard = startBoard;
    this.allPlayerStates = allPlayerStates;
  }

  public static buildFromSetup(setup: GameSetup): GameSetup {
    const boardWidth = setup.boardWidth ?? 7;
    const boardHeight = setup.boardHeight ?? 7;
    if (!Board.isSizeValid(boardWidth) || !Board.isSizeValid(boardHeight)) {
      throw new Error(`Invalid board size`);
    }
    const maxPlayers = Board.getMaxPlayerCount(boardWidth, boardHeight);
    if (setup.players.length > maxPlayers) {
      throw new Error(`Too many players. Max ${maxPlayers}`);
    }
    if (setup.players.length < 2) {
      throw new Error("Too few players. Min 2");
    }
    const generator = new RandomNumberGenerator(setup.seed);
    const treasures = GameSetup.generateTreasures(
      GameSetup.getTreasureCount(setup.players.length)
    );
    const allPlayerStates = GameSetup.generatePlayerStates(
      generator,
      setup.players.length,
      treasures,
      boardWidth,
      boardHeight
    );
    const board = GameSetup.generateRandomBoard(
      generator,
      treasures,
      boardWidth,
      boardHeight
    );
    return new GameSetup(board, allPlayerStates);
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
    const getRandomTreasure = GameSetup.getRandomTreasureProvider(
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
            GameSetup.generateRandomTileType(generator),
            null,
            Math.floor(generator.rand() * 4),
            null
          );
        }
      }
    }
    let looseTile = new PathTile(
      GameSetup.generateRandomTileType(generator),
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
    const getRandomTreasure = GameSetup.getRandomTreasureProvider(
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
    // build AllPlayerStates
    return new AllPlayerStates(playerStates);
  }

  private static generateTreasures(amount: number): Treasure[] {
    const treasures = [];
    for (let i = 0; i < amount; i++) {
      treasures.push(new Treasure(i));
    }
    return treasures;
  }
}
