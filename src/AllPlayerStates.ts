/**
 * @author Timo Lehnertz
 */
import { BoardPosition } from "./BoardPosition";
import { PlayerState } from "./PlayerState";
import { Treasure } from "./Treasure";

/**
 * Immutable AllPlayerStates class containing the states of all players
 */
export class AllPlayerStates {
  private readonly allPlayerStates: PlayerState[];
  public readonly playerIndexToMove: number;

  public constructor(
    allPlayerStates: PlayerState[],
    playerIndexToMove: number
  ) {
    this.allPlayerStates = allPlayerStates;
    this.playerIndexToMove = playerIndexToMove;
  }

  private copyPlayerStates(): PlayerState[] {
    const newAllPlayerStates: PlayerState[] = [];
    for (const playerState of this.allPlayerStates) {
      newAllPlayerStates.push(playerState);
    }
    return newAllPlayerStates;
  }

  public collectTreasure(
    playerIndex: number,
    foundTreasure: Treasure
  ): AllPlayerStates {
    const newAllPlayerStates = this.copyPlayerStates();
    newAllPlayerStates[playerIndex] =
      newAllPlayerStates[playerIndex].collectTreasure(foundTreasure);
    return new AllPlayerStates(newAllPlayerStates, this.playerIndexToMove);
  }

  public removeLastTreasure(playerIndex: number) {
    const newAllPlayerStates = this.copyPlayerStates();
    newAllPlayerStates[playerIndex] =
      newAllPlayerStates[playerIndex].removeLastTreasure();
    return new AllPlayerStates(newAllPlayerStates, this.playerIndexToMove);
  }

  public mutateAll(
    mutationCallback: (playerState: PlayerState) => PlayerState
  ): AllPlayerStates {
    const newAllPlayerStates = this.copyPlayerStates();
    for (let i = 0; i < newAllPlayerStates.length; i++) {
      newAllPlayerStates[i] = mutationCallback(newAllPlayerStates[i]);
    }
    return new AllPlayerStates(newAllPlayerStates, this.playerIndexToMove);
  }

  public movePlayer(playerIndex: number, to: BoardPosition): AllPlayerStates {
    const newAllPlayerStates = this.copyPlayerStates();
    newAllPlayerStates[playerIndex] =
      newAllPlayerStates[playerIndex].setPosition(to);
    return new AllPlayerStates(newAllPlayerStates, this.playerIndexToMove);
  }

  public getPlayerToMoveState(): PlayerState {
    return this.getPlayerState(this.playerIndexToMove);
  }

  public getPlayerState(playerIndex: number): PlayerState {
    return this.allPlayerStates[playerIndex];
  }

  public nextPlayer(): AllPlayerStates {
    return new AllPlayerStates(
      this.allPlayerStates,
      (this.playerIndexToMove + 1) % this.allPlayerStates.length
    );
  }

  public prevPlayer(): AllPlayerStates {
    let newPlayerIndexToMove = this.playerIndexToMove - 1;
    if (newPlayerIndexToMove < 0) {
      newPlayerIndexToMove = this.allPlayerStates.length - 1;
    }
    return new AllPlayerStates(this.allPlayerStates, newPlayerIndexToMove);
  }

  public getPlayerStatesWithAllTreasures(): {
    playerIndex: number;
    playerState: PlayerState;
  }[] {
    const playerStates: {
      playerIndex: number;
      playerState: PlayerState;
    }[] = [];
    for (let i = 0; i < this.allPlayerStates.length; i++) {
      const playerState = this.allPlayerStates[i];
      if (playerState.remainingTreasureCount === 0) {
        playerStates.push({ playerState, playerIndex: i });
      }
    }
    return playerStates;
  }

  public equals(other: AllPlayerStates): boolean {
    if (this.playerIndexToMove !== other.playerIndexToMove) {
      return false;
    }
    if (this.allPlayerStates.length !== other.allPlayerStates.length) {
      return false;
    }
    for (let i = 0; i < this.allPlayerStates.length; i++) {
      const a = this.allPlayerStates[i];
      const b = other.allPlayerStates[i];
      if (!a.equals(b)) {
        return false;
      }
    }
    return true;
  }

  public static create(instance: AllPlayerStates): AllPlayerStates {
    const allPlayerStates: PlayerState[] = [];
    for (const playerState of instance.allPlayerStates) {
      allPlayerStates.push(PlayerState.create(playerState));
    }
    return new AllPlayerStates(allPlayerStates, instance.playerIndexToMove);
  }
}
