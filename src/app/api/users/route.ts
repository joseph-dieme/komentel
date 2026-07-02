import { NextResponse } from "next/server";
import { UserService } from "@/kaos/services/UserService";
import { UserRepository } from "@/kaos/repositories/UserRepository";
import { EventDispatcher } from "@/kaos/core/events";

const userRepo = new UserRepository();
const eventDispatcher = new EventDispatcher();
const userService = new UserService(userRepo, eventDispatcher);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await userService.register(body);
    return NextResponse.json(user, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
