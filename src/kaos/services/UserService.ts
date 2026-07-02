// User Service - Business logic orchestration for Users and Journalist Accreditations
import { IUserRepository } from "../repositories/UserRepository";
import { IEventDispatcher } from "../core/events";
import { RegisteredUser } from "../core/types";

export class UserService {
  constructor(
    private userRepo: IUserRepository,
    private eventDispatcher: IEventDispatcher
  ) {}

  async register(user: Omit<RegisteredUser, 'duelsStats'>): Promise<RegisteredUser> {
    if (!user.name.trim() || !user.email.trim()) {
      throw new Error("Name and Email are required");
    }

    const existingUser = await this.userRepo.getByEmail(user.email);
    if (existingUser) {
      throw new Error("A user with this email already exists");
    }

    const registered = await this.userRepo.create({
      ...user,
      accredited: user.role === "ADMIN" ? true : false // Admins are accredited by default
    });

    await this.eventDispatcher.dispatch("UserRegistered", {
      email: registered.email,
      name: registered.name,
      role: registered.role
    });

    return registered;
  }

  async accredit(email: string): Promise<RegisteredUser> {
    const user = await this.userRepo.getByEmail(email);
    if (!user) throw new Error("User not found");
    if (user.role !== "JOURNALIST") throw new Error("User is not a registered journalist");

    const updated = await this.userRepo.update(email, { accredited: true });
    
    console.log(`[KAOS UserService] Accredited journalist: ${email}`);
    
    return updated;
  }

  async getUserProfile(email: string): Promise<RegisteredUser | null> {
    return this.userRepo.getByEmail(email);
  }
}
