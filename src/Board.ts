/**
 * @author Timo lehnertz
 */
import { BoardPosition } from "./BoardPosition";
import { Heading, HeadingHelper } from "./Heading";
import { Path, PathPart } from "./Path";
import { ShiftPosition } from "./ShiftPosition";
import { PathTile } from "./PathTile";
import { Treasure } from "./Treasure";

/**
 * Immutable Board class representing the gameboard.
 */
export class Board {
  private tiles: PathTile[][];
  public readonly looseTile: PathTile;
  public readonly shiftPosition: ShiftPosition;
  public readonly width: number;
  public readonly height: number;

  /**
   * @param tiles Must a quadratic array
   * @param looseTile the tile that is currently free
   */
  public constructor(
    tiles: PathTile[][],
    looseTile: PathTile,
    shiftPosition: ShiftPosition
  ) {
    this.tiles = tiles;
    this.looseTile = looseTile;
    this.shiftPosition = shiftPosition;
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

  public insertLooseTile() {
    let currentPosition = this.getFirstMovedTilePosition(this.shiftPosition);
    const newTiles = this.copyTiles();
    let lastTile = this.looseTile;
    while (currentPosition.isInBounds(this.width, this.height)) {
      const tmp = newTiles[currentPosition.x][currentPosition.y];
      newTiles[currentPosition.x][currentPosition.y] = lastTile;
      lastTile = tmp;
      currentPosition = currentPosition.add(this.shiftPosition.shiftVector);
    }
    return new Board(
      newTiles,
      lastTile,
      this.invertShiftPosition(this.shiftPosition)
    );
  }

  public generateDistances(from: BoardPosition): number[][] {
    const distances: number[][] = [];
    for (let x = 0; x < this.width; x++) {
      const column: number[] = [];
      for (let y = 0; y < this.height; y++) {
        column[y] = Number.MAX_SAFE_INTEGER;
      }
      distances[x] = column;
    }
    const checkDistance = (position: BoardPosition, distance: number) => {
      if (distances[position.x][position.y] > distance) {
        distances[position.x][position.y] = distance;
      } else {
        return;
      }
      const tile = this.getTile(position);
      for (const openHeading of tile.openSides.headings) {
        const direction = new HeadingHelper(openHeading).vec2;
        const nextPos = position.add(direction);
        if (!nextPos.isInBounds(this.width, this.height)) {
          continue;
        }
        const nextTile = this.getTile(nextPos);
        if (!nextTile.openSides.isOpposingOpen(openHeading)) {
          continue;
        }
        checkDistance(nextPos, distance + 1);
      }
    };
    // build distance grid
    checkDistance(from, 0);
    return distances;
  }

  public generateShortestPath(
    from: BoardPosition,
    to: BoardPosition
  ): Path | null {
    if (from.equals(to)) {
      return new Path([]);
    }
    const distances = this.generateDistances(to);
    // check if reachable
    if (distances[from.x][from.y] === Number.MAX_SAFE_INTEGER) {
      return null;
    }
    const pathParts: PathPart[] = [];
    let currentLocation = from;
    while (!currentLocation.equals(to)) {
      let minDistance = Number.MAX_SAFE_INTEGER;
      let bestHeading: Heading | null = null;
      const currentTile = this.getTile(currentLocation);
      for (const heading of currentTile.openSides.headings) {
        const nextLocation = currentLocation.add(
          new HeadingHelper(heading).vec2
        );
        if (!nextLocation.isInBounds(this.width, this.height)) {
          continue;
        }
        const nextTile = this.getTile(nextLocation);
        if (!nextTile.openSides.isOpposingOpen(heading)) {
          continue;
        }
        if (distances[nextLocation.x][nextLocation.y] < minDistance) {
          minDistance = distances[nextLocation.x][nextLocation.y];
          bestHeading = heading;
        }
      }
      const nextPos = currentLocation.add(
        new HeadingHelper(bestHeading ?? Heading.NORTH).vec2
      );
      if (bestHeading === null) {
        throw new Error("Bug");
      }
      pathParts.push({
        from: currentLocation,
        to: nextPos,
        heading: bestHeading,
      });
      currentLocation = nextPos;
    }
    return new Path(pathParts);
  }

  public getReachablePositions(from: BoardPosition): BoardPosition[] {
    const checkedLocations: boolean[][] = [];
    for (let x = 0; x < this.width; x++) {
      const column: boolean[] = [];
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
        const nextPos = position.add(direction);
        if (!nextPos.isInBounds(this.width, this.height)) {
          continue;
        }
        const nextTile = this.tiles[nextPos.x][nextPos.y];
        if (!nextTile.openSides.isOpposingOpen(openHeading)) {
          continue;
        }
        check(nextPos);
      }
    };
    check(from);
    return reachablePositions;
  }

  public isReachable(from: BoardPosition, to: BoardPosition): boolean {
    const distances = this.generateDistances(from);
    if (distances[to.x][to.y] === Number.MAX_SAFE_INTEGER) {
      return false;
    }
    return true;
  }

  public rotateLooseTile(rotateBeforeShift: number): Board {
    return new Board(
      this.tiles,
      this.looseTile.rotate(rotateBeforeShift),
      this.shiftPosition
    );
  }

  public static getValidSizes(maxSize: number): number[] {
    const validSizes: number[] = [];
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
    if (size < 7) {
      throw new Error("Invalid size");
    }
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
        const pos = new BoardPosition(x, y);
        if (pos.isEdge(width, height)) {
          homePositions.push(pos);
        }
      }
    }
    return homePositions;
  }

  public static getPlayerHomePosition(
    playerIndex: number,
    width: number,
    height: number
  ): BoardPosition {
    const homePositions = Board.generatePlayerHomePositions(width, height);
    return homePositions[playerIndex];
  }

  public generateValidShiftPositions(): ShiftPosition[] {
    const shiftPositions: ShiftPosition[] = [];
    for (const heading of [Heading.NORTH, Heading.SOUTH]) {
      let index = 0;
      for (let x = 1; x < this.width - 1; x += 2) {
        shiftPositions.push(new ShiftPosition(heading, index++));
      }
    }
    for (const heading of [Heading.WEST, Heading.EAST]) {
      let index = 0;
      for (let x = 1; x < this.height - 1; x += 2) {
        shiftPositions.push(new ShiftPosition(heading, index++));
      }
    }
    return shiftPositions;
  }

  private static getShiftPositionCount(size: number): number {
    return (size - 1) / 2;
  }

  public isShiftPositionValid(shiftPosition: ShiftPosition): boolean {
    if (shiftPosition.index < 0 || !Number.isInteger(shiftPosition.index)) {
      return false;
    }
    switch (shiftPosition.heading) {
      case Heading.NORTH:
      case Heading.SOUTH:
        return shiftPosition.index < Board.getShiftPositionCount(this.width);
      case Heading.EAST:
      case Heading.WEST:
        return shiftPosition.index < Board.getShiftPositionCount(this.height);
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

  public setShiftPosition(shiftPosition: ShiftPosition): Board {
    return new Board(this.tiles, this.looseTile, shiftPosition);
  }

  /**
   * Because Tile is immutable we dont need to make a deep copy here
   */
  private copyTiles(): PathTile[][] {
    const newTiles: PathTile[][] = [];
    for (const column of this.tiles) {
      const newColumn: PathTile[] = [];
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
      console.log("looseTile");
      return false;
    }
    if (!this.shiftPosition.equals(other.shiftPosition)) {
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

  static create(instance: Board): Board {
    const tiles: PathTile[][] = [];
    for (const row of instance.tiles) {
      const newRow: PathTile[] = [];
      for (const tile of row) {
        newRow.push(PathTile.create(tile));
      }
      tiles.push(newRow);
    }
    return new Board(
      tiles,
      PathTile.create(instance.looseTile),
      ShiftPosition.create(instance.shiftPosition)
    );
  }
}
