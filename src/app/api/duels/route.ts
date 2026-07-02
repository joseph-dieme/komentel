import { NextResponse } from "next/server";
import { DuelService } from "@/kaos/services/DuelService";
import { DuelRepository } from "@/kaos/repositories/DuelRepository";
import { UserRepository } from "@/kaos/repositories/UserRepository";
import { EventDispatcher } from "@/kaos/core/events";

const duelRepo = new DuelRepository();
const userRepo = new UserRepository();
const eventDispatcher = new EventDispatcher();
const duelService = new DuelService(duelRepo, userRepo, eventDispatcher);

export async function GET() {
  try {
    const duels = await duelRepo.getAll();
    return NextResponse.json(duels, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { articleId, articleTitle, commentId, challenger, defender } = body;
    const duel = await duelService.challengeUser(
      articleId,
      articleTitle,
      commentId,
      challenger,
      defender
    );
    return NextResponse.json(duel, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
