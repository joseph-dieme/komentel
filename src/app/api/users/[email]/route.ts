import { NextResponse } from "next/server";
import { UserService } from "@/kaos/services/UserService";
import { UserRepository } from "@/kaos/repositories/UserRepository";
import { EventDispatcher } from "@/kaos/core/events";

const userRepo = new UserRepository();
const eventDispatcher = new EventDispatcher();
const userService = new UserService(userRepo, eventDispatcher);

export async function GET(request: Request, context: any) {
  try {
    const { email } = await context.params;
    const user = await userService.getUserProfile(decodeURIComponent(email));
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
