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

  public constructor(allPlayerStates: PlayerState[]) {
    this.allPlayerStates = allPlayerStates;
  }

  public copyPlayerStates(): PlayerState[] {
    const newAllPlayerStates = [];
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
    return new AllPlayerStates(newAllPlayerStates);
  }

  public removeLastTreasure(playerIndex: number) {
    const newAllPlayerStates = this.copyPlayerStates();
    newAllPlayerStates[playerIndex] =
      newAllPlayerStates[playerIndex].removeLastTreasure();
    return new AllPlayerStates(newAllPlayerStates);
  }

  public mutateAll(
    mutationCallback: (playerState: PlayerState) => PlayerState
  ): AllPlayerStates {
    const newAllPlayerStates = this.copyPlayerStates();
    for (let i = 0; i < newAllPlayerStates.length; i++) {
      newAllPlayerStates[i] = mutationCallback(newAllPlayerStates[i]);
    }
    return new AllPlayerStates(newAllPlayerStates);
  }

  public movePlayer(playerIndex: number, to: BoardPosition): AllPlayerStates {
    const newAllPlayerStates = this.copyPlayerStates();
    newAllPlayerStates[playerIndex] =
      newAllPlayerStates[playerIndex].setPosition(to);
    return new AllPlayerStates(newAllPlayerStates);
  }

  public getPlayerState(playerIndex: number): PlayerState {
    return this.allPlayerStates[playerIndex];
  }
}
