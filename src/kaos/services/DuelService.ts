// Duel Service - Business logic orchestration for Debates and 1v1 Duels
import { IDuelRepository } from "../repositories/DuelRepository";
import { IUserRepository } from "../repositories/UserRepository";
import { IEventDispatcher } from "../core/events";
import { Duel } from "../core/types";

export class DuelService {
  constructor(
    private duelRepo: IDuelRepository,
    private userRepo: IUserRepository,
    private eventDispatcher: IEventDispatcher
  ) {}

  async challengeUser(
    articleId: string,
    articleTitle: string,
    commentId: string,
    challengerName: string,
    defenderName: string
  ): Promise<Duel> {
    const challenger = await this.userRepo.getByEmail(challengerName);
    const defender = await this.userRepo.getByEmail(defenderName);

    // Calculate dynamic closing date (48 hours by default)
    const closesAt = new Date();
    closesAt.setHours(closesAt.getHours() + 48);

    const duel = await this.duelRepo.create({
      articleId,
      articleTitle,
      commentId,
      challenger: challenger?.name || challengerName,
      challengerStats: challenger?.duelsStats || { wins: 0, losses: 0, ratio: 0 },
      defender: defender?.name || defenderName,
      defenderStats: defender?.duelsStats || { wins: 0, losses: 0, ratio: 0 },
      status: "PENDING",
      roundLimit: 3,
      currentRound: 1,
      currentTurn: "CHALLENGER",
      rounds: [
        {
          turn: 1,
          challengerReply: null,
          defenderReply: null,
          challengerLikes: 0,
          challengerDislikes: 0,
          defenderLikes: 0,
          defenderDislikes: 0
        }
      ],
      closesAt: closesAt.toLocaleString()
    });

    await this.eventDispatcher.dispatch("DuelStarted", {
      duelId: duel.id,
      challenger: duel.challenger,
      defender: duel.defender,
      closesAt: duel.closesAt
    });

    return duel;
  }

  async acceptChallenge(duelId: string): Promise<Duel> {
    const duel = await this.duelRepo.getById(duelId);
    if (!duel) throw new Error("Duel not found");
    if (duel.status !== "PENDING") throw new Error("Duel is not pending acceptance");

    return this.duelRepo.update(duelId, { status: "ACTIVE" });
  }

  async submitReply(duelId: string, writerName: string, replyText: string): Promise<Duel> {
    const duel = await this.duelRepo.getById(duelId);
    if (!duel) throw new Error("Duel not found");
    if (duel.status !== "ACTIVE") throw new Error("Duel is not active");

    const isChallenger = writerName === duel.challenger;
    const isDefender = writerName === duel.defender;

    if (!isChallenger && !isDefender) {
      throw new Error("Writer is not a participant in this duel");
    }

    const currentTurn = duel.currentTurn;
    if (currentTurn === "CHALLENGER" && !isChallenger) {
      throw new Error("It is not the defender's turn yet");
    }
    if (currentTurn === "DEFENDER" && !isDefender) {
      throw new Error("It is not the challenger's turn yet");
    }

    const updatedRounds = [...duel.rounds];
    const currentRoundIdx = duel.currentRound - 1;
    const currentRound = updatedRounds[currentRoundIdx];

    let nextTurn: 'CHALLENGER' | 'DEFENDER' = "CHALLENGER";
    let nextRound = duel.currentRound;

    if (currentTurn === "CHALLENGER") {
      currentRound.challengerReply = replyText;
      nextTurn = "DEFENDER";
    } else {
      currentRound.defenderReply = replyText;
      if (duel.currentRound < duel.roundLimit) {
        nextRound = duel.currentRound + 1;
        updatedRounds.push({
          turn: nextRound,
          challengerReply: null,
          defenderReply: null,
          challengerLikes: 0,
          challengerDislikes: 0,
          defenderLikes: 0,
          defenderDislikes: 0
        });
        nextTurn = "CHALLENGER";
      } else {
        // Last round reached, close duel
        return this.closeDuel(duelId, updatedRounds);
      }
    }

    return this.duelRepo.update(duelId, {
      rounds: updatedRounds,
      currentRound: nextRound,
      currentTurn: nextTurn
    });
  }

  private async closeDuel(duelId: string, finalRounds: any[]): Promise<Duel> {
    const duel = await this.duelRepo.update(duelId, {
      status: "CLOSED",
      rounds: finalRounds
    });

    await this.eventDispatcher.dispatch("DuelFinished", {
      duelId: duel.id,
      challenger: duel.challenger,
      defender: duel.defender
    });

    return duel;
  }
}
