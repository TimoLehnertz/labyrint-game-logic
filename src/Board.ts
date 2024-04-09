/**
 * @author Timo lehnertz
 */
import { BoardPosition } from "./BoardPosition";
import { Heading, HeadingHelper } from "./Heading";
import { Path } from "./Path";
import { ShiftPosition } from "./ShiftPosition";
import { PathTile } from "./PathTile";
import { Treasure } from "./Treasure";

/**
 * Immutable Board class representing the gameboard.
 */
export class Board {
  private tiles: PathTile[][];
  public readonly looseTile: PathTile;
  public readonly width: number;
  public readonly height: number;

  /**
   * @param tiles Must a quadratic array
   * @param looseTile the tile that is currently free
   */
  public constructor(tiles: PathTile[][], looseTile: PathTile) {
    this.tiles = tiles;
    this.looseTile = looseTile;
    this.width = tiles.length;
    this.height = tiles[0].length;
    for (const row of tiles) {
      if (row.length !== this.height) {
        throw new Error("Tiles of have invalid shape");
      }
    }
    if (!Board.isSizeValid(this.width) || !Board.isSizeValid(this.height)) {
      throw new Error(
        "The provided size is invalid! Size must be >= 7 and cant be prime"
      );
    }
  }

  public shift(shiftPosition: ShiftPosition) {
    let currentPosition = this.getFirstMovedTilePosition(shiftPosition);
    const newTiles = this.copyTiles();
    let lastTile = this.looseTile;
    while (currentPosition.isInBounds(this.width, this.height)) {
      const tmp = newTiles[currentPosition.x][currentPosition.y];
      newTiles[currentPosition.x][currentPosition.y] = lastTile;
      lastTile = tmp;
      currentPosition = currentPosition.add(shiftPosition.shiftVector);
    }
    return new Board(newTiles, lastTile);
  }

  public generateShortestPath(
    from: BoardPosition,
    to: BoardPosition
  ): Path | null {
    const distances: number[][] = [];
    for (let x = 0; x < this.width; x++) {
      const column = [];
      for (let y = 0; y < this.height; y++) {
        column[y] = Number.MAX_SAFE_INTEGER;
      }
      distances[x] = column;
    }
    const checkDistance = (position: BoardPosition, distance: number) => {
      if (!position.isInBounds(this.width, this.height)) {
        return;
      }
      if (distances[position.x][position.y] > distance) {
        distances[position.x][position.y] = distance;
      } else {
        return;
      }
      const tile = this.tiles[position.x][position.y];
      for (const openHeading of tile.openSides.headings) {
        const direction = new HeadingHelper(openHeading).vec2;
        checkDistance(position.add(direction), distance + 1);
      }
    };
    // build distance grid
    checkDistance(from, 0);
    // check if reachable
    if (distances[to.x][to.y] === Number.MAX_SAFE_INTEGER) {
      return null;
    }
    const pathPositions: BoardPosition[] = [];
    let currentLocation = from;
    while (!currentLocation.equals(to)) {
      let minDistance = Number.MAX_SAFE_INTEGER;
      let bestHeading: Heading | null = null;
      for (const heading of HeadingHelper.getAllHeadings()) {
        const newLocation = currentLocation.add(
          new HeadingHelper(heading).vec2
        );
        if (!newLocation.isInBounds(this.width, this.height)) {
          continue;
        }
        if (distances[newLocation.x][newLocation.y] <= minDistance) {
          minDistance = distances[newLocation.x][newLocation.y];
          bestHeading = heading;
        }
      }
      pathPositions.push(currentLocation);
      currentLocation = currentLocation.add(
        new HeadingHelper(bestHeading ?? Heading.NORTH).vec2
      );
    }
    return new Path(pathPositions);
  }

  public getReachablePositions(from: BoardPosition): BoardPosition[] {
    const checkedLocations: boolean[][] = [];
    for (let x = 0; x < this.width; x++) {
      const column = [];
      for (let y = 0; y < this.height; y++) {
        column[y] = false;
      }
      checkedLocations[x] = column;
    }
    const reachablePositions: BoardPosition[] = [];
    const check = (position: BoardPosition) => {
      if (
        !position.isInBounds(this.width, this.height) ||
        checkedLocations[position.x][position.y]
      ) {
        return;
      }
      reachablePositions.push(position);
      checkedLocations[position.x][position.y] = true;
      // check surrounding
      const tile = this.tiles[position.x][position.y];
      for (const openHeading of tile.openSides.headings) {
        const direction = new HeadingHelper(openHeading).vec2;
        check(position.add(direction));
      }
    };
    check(from);
    return reachablePositions;
  }

  /**
   * Same algorithm as getReachablePositions just returns as soon as
   * path is found so it is a faster or equal when there is a path
   */
  public isReachable(from: BoardPosition, to: BoardPosition): boolean {
    const checkedLocations: boolean[][] = [];
    for (let x = 0; x < this.width; x++) {
      const column = [];
      for (let y = 0; y < this.height; y++) {
        column[y] = false;
      }
      checkedLocations[x] = column;
    }
    const check = (position: BoardPosition): boolean => {
      if (
        !position.isInBounds(this.width, this.height) ||
        checkedLocations[position.x][position.y]
      ) {
        return false;
      }
      if (position.equals(to)) {
        return true;
      }
      checkedLocations[position.x][position.y] = true;
      // check surrounding
      const tile = this.tiles[position.x][position.y];
      for (const openHeading of tile.openSides.headings) {
        const direction = new HeadingHelper(openHeading).vec2;
        if (check(position.add(direction))) {
          return true;
        }
      }
      return false;
    };
    return check(from);
  }

  public rotateLooseTile(rotateBeforeShift: number): Board {
    return new Board(this.tiles, this.looseTile.rotate(rotateBeforeShift));
  }

  public static getValidSizes(maxSize: number): number[] {
    const validSizes = [];
    for (let i = 0; i <= maxSize; i++) {
      if (Board.isSizeValid(i)) {
        validSizes.push(i);
      }
    }
    return validSizes;
  }

  /**
   * @param size Width or height
   */
  public static isSizeValid(size: number): boolean {
    return (
      size >= 7 && // must be larger than the min size
      ((size - 1) % 4 === 0 || (size - 1) % 5 === 0 || (size - 1) % 6 === 0) && // must be possible to distribute players home positions equaly
      size % 2 != 0 // has to be uneven to not have shift rows at the edge
    );
  }

  public static getMaxPlayerCount(width: number, height: number): number {
    return Board.generatePlayerHomePositions(width, height).length;
  }

  public static getHomePositionIncrement(size: number): number {
    size -= 1;
    if (size % 4 === 0) {
      return 4;
    }
    if (size % 5 === 0) {
      return 5;
    }
    if (size % 6 === 0) {
      return 6;
    }
    throw new Error("Invalid size");
  }

  public static generatePlayerHomePositions(
    width: number,
    height: number
  ): BoardPosition[] {
    const homePositions: BoardPosition[] = [];
    const xIncrement = Board.getHomePositionIncrement(width);
    const YIncrement = Board.getHomePositionIncrement(height);
    for (let x = 0; x < width; x += xIncrement) {
      for (let y = 0; y < height; y += YIncrement) {
        homePositions.push(new BoardPosition(x, y));
      }
    }
    return homePositions;
  }

  public getPlayerHomePosition(playerIndex: number): BoardPosition {
    return Board.getPlayerHomePosition(playerIndex, this.width, this.height);
  }

  public static getPlayerHomePosition(
    playerIndex: number,
    width: number,
    height: number
  ): BoardPosition {
    const homePositions = Board.generatePlayerHomePositions(width, height);
    return homePositions[playerIndex];
  }

  public generateValieShiftPositions(): ShiftPosition[] {
    const shiftPositions = [];
    // north
    for (let i = 1; i < this.width - 1; i += 2) {
      shiftPositions.push(new ShiftPosition(Heading.NORTH, i));
    }
    // east
    for (let i = 1; i < this.height - 1; i += 2) {
      shiftPositions.push(new ShiftPosition(Heading.EAST, i));
    }
    // south
    for (let i = 1; i < this.width - 1; i += 2) {
      shiftPositions.push(new ShiftPosition(Heading.SOUTH, i));
    }
    // west
    for (let i = 1; i < this.height - 1; i += 2) {
      shiftPositions.push(new ShiftPosition(Heading.WEST, i));
    }
    return shiftPositions;
  }

  public isShiftPositionValid(shiftPosition: ShiftPosition): boolean {
    switch (shiftPosition.heading) {
      case Heading.NORTH:
      case Heading.SOUTH:
        return shiftPosition.index < this.width;
      case Heading.EAST:
      case Heading.WEST:
        return shiftPosition.index < this.height;
    }
  }

  public invertShiftPosition(shiftPosition: ShiftPosition): ShiftPosition {
    const invertedHeading = new HeadingHelper(shiftPosition.heading).inverted;
    return new ShiftPosition(invertedHeading, shiftPosition.index);
  }

  public getLastMovedTilePosition(shiftPosition: ShiftPosition): BoardPosition {
    return this.getFirstMovedTilePosition(
      this.invertShiftPosition(shiftPosition)
    );
  }

  public getFirstMovedTilePosition(
    shiftPosition: ShiftPosition
  ): BoardPosition {
    switch (shiftPosition.heading) {
      case Heading.NORTH:
        return new BoardPosition(1 + shiftPosition.index * 2, 0);
      case Heading.EAST:
        return new BoardPosition(this.width - 1, 1 + shiftPosition.index * 2);
      case Heading.SOUTH:
        return new BoardPosition(1 + shiftPosition.index * 2, this.height - 1);
      case Heading.WEST:
        return new BoardPosition(0, 1 + shiftPosition.index * 2);
    }
  }

  /**
   * Because Tile is immutable we dont need to make a deep copy here
   */
  private copyTiles(): PathTile[][] {
    const newTiles: PathTile[][] = [];
    for (const column of this.tiles) {
      const newColumn = [];
      for (const tile of column) {
        newColumn.push(tile);
      }
      newTiles.push(newColumn);
    }
    return newTiles;
  }

  public getTile(position: BoardPosition): PathTile {
    return this.tiles[position.x][position.y];
  }

  public getTreasureAt(position: BoardPosition): Treasure | null {
    return this.tiles[position.x][position.y].treasure;
  }

  public equals(other: Board): boolean {
    if (!this.looseTile.equals(other.looseTile)) {
      return false;
    }
    if (this.width !== other.width || this.height !== other.height) {
      return false;
    }
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (!this.tiles[x][y].equals(other.tiles[x][y])) {
          return false;
        }
      }
    }
    return true;
  }
}
