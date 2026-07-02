// User Repository - Abstraction of database operations on Registered Users for KAOS
import { RegisteredUser } from "../core/types";
import { supabase } from "@/lib/supabase";

export interface IUserRepository {
  getByEmail(email: string): Promise<RegisteredUser | null>;
  getAll(): Promise<RegisteredUser[]>;
  create(user: Omit<RegisteredUser, 'duelsStats'>): Promise<RegisteredUser>;
  update(email: string, user: Partial<RegisteredUser>): Promise<RegisteredUser>;
}

export class UserRepository implements IUserRepository {
  async getByEmail(email: string): Promise<RegisteredUser | null> {
    const { data, error } = await supabase
      .from("registered_users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) return null;
    return this.mapToDomain(data);
  }

  async getAll(): Promise<RegisteredUser[]> {
    const { data, error } = await supabase
      .from("registered_users")
      .select("*")
      .order("name", { ascending: true });

    if (error || !data) return [];
    return data.map(d => this.mapToDomain(d));
  }

  async create(user: Omit<RegisteredUser, 'duelsStats'>): Promise<RegisteredUser> {
    const newUser = {
      name: user.name,
      email: user.email,
      role: user.role || "USER",
      password: user.password || "",
      accredited: user.accredited || false,
      press_card: user.pressCard,
      media: user.media,
      bio: user.bio,
      photo_url: user.photoUrl,
      interests: JSON.stringify(user.interests || []),
      duels_stats: JSON.stringify({ wins: 0, losses: 0, ratio: 0 })
    };

    const { data, error } = await supabase
      .from("registered_users")
      .insert(newUser)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create registered user: ${error?.message}`);
    }

    return this.mapToDomain(data);
  }

  async update(email: string, user: Partial<RegisteredUser>): Promise<RegisteredUser> {
    const mappedUpdates: any = {};
    if (user.name !== undefined) mappedUpdates.name = user.name;
    if (user.role !== undefined) mappedUpdates.role = user.role;
    if (user.password !== undefined) mappedUpdates.password = user.password;
    if (user.accredited !== undefined) mappedUpdates.accredited = user.accredited;
    if (user.pressCard !== undefined) mappedUpdates.press_card = user.pressCard;
    if (user.media !== undefined) mappedUpdates.media = user.media;
    if (user.bio !== undefined) mappedUpdates.bio = user.bio;
    if (user.photoUrl !== undefined) mappedUpdates.photo_url = user.photoUrl;
    if (user.interests !== undefined) mappedUpdates.interests = JSON.stringify(user.interests);
    if (user.duelsStats !== undefined) mappedUpdates.duels_stats = JSON.stringify(user.duelsStats);

    const { data, error } = await supabase
      .from("registered_users")
      .update(mappedUpdates)
      .eq("email", email)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update user ${email}: ${error?.message}`);
    }

    return this.mapToDomain(data);
  }

  private mapToDomain(dbUser: any): RegisteredUser {
    return {
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role || "USER",
      password: dbUser.password,
      accredited: dbUser.accredited || false,
      pressCard: dbUser.press_card,
      media: dbUser.media,
      bio: dbUser.bio,
      photoUrl: dbUser.photo_url,
      interests: typeof dbUser.interests === "string" ? JSON.parse(dbUser.interests) : dbUser.interests || [],
      duelsStats: typeof dbUser.duels_stats === "string" ? JSON.parse(dbUser.duels_stats) : dbUser.duels_stats || { wins: 0, losses: 0, ratio: 0 }
    };
  }
}
