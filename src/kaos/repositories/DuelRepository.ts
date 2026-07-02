// Duel Repository - Abstraction of database operations on Duels/Debates for KAOS
import { Duel } from "../core/types";
import { supabase } from "@/lib/supabase";

export interface IDuelRepository {
  getById(id: string): Promise<Duel | null>;
  getAll(): Promise<Duel[]>;
  create(duel: Omit<Duel, 'id' | 'winner'>): Promise<Duel>;
  update(id: string, duel: Partial<Duel>): Promise<Duel>;
}

export class DuelRepository implements IDuelRepository {
  async getById(id: string): Promise<Duel | null> {
    const { data, error } = await supabase
      .from("duels")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return this.mapToDomain(data);
  }

  async getAll(): Promise<Duel[]> {
    const { data, error } = await supabase
      .from("duels")
      .select("*")
      .order("id", { ascending: false });

    if (error || !data) return [];
    return data.map(d => this.mapToDomain(d));
  }

  async create(duel: Omit<Duel, 'id' | 'winner'>): Promise<Duel> {
    const newDuel = {
      article_id: duel.articleId,
      article_title: duel.articleTitle,
      comment_id: duel.commentId,
      challenger: duel.challenger,
      challenger_stats: JSON.stringify(duel.challengerStats),
      defender: duel.defender,
      defender_stats: JSON.stringify(duel.defenderStats),
      status: duel.status,
      round_limit: duel.roundLimit,
      current_round: duel.currentRound,
      current_turn: duel.currentTurn,
      rounds: JSON.stringify(duel.rounds),
      closes_at: duel.closesAt,
      winner: null
    };

    const { data, error } = await supabase
      .from("duels")
      .insert(newDuel)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create duel: ${error?.message}`);
    }

    return this.mapToDomain(data);
  }

  async update(id: string, duel: Partial<Duel>): Promise<Duel> {
    const mappedUpdates: any = {};
    if (duel.status !== undefined) mappedUpdates.status = duel.status;
    if (duel.currentRound !== undefined) mappedUpdates.current_round = duel.currentRound;
    if (duel.currentTurn !== undefined) mappedUpdates.current_turn = duel.currentTurn;
    if (duel.rounds !== undefined) mappedUpdates.rounds = JSON.stringify(duel.rounds);
    if (duel.winner !== undefined) mappedUpdates.winner = duel.winner;

    const { data, error } = await supabase
      .from("duels")
      .update(mappedUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update duel ${id}: ${error?.message}`);
    }

    return this.mapToDomain(data);
  }

  private mapToDomain(dbDuel: any): Duel {
    return {
      id: dbDuel.id,
      articleId: dbDuel.article_id,
      articleTitle: dbDuel.article_title,
      commentId: dbDuel.comment_id,
      challenger: dbDuel.challenger,
      challengerStats: typeof dbDuel.challenger_stats === "string" ? JSON.parse(dbDuel.challenger_stats) : dbDuel.challenger_stats,
      defender: dbDuel.defender,
      defenderStats: typeof dbDuel.defender_stats === "string" ? JSON.parse(dbDuel.defender_stats) : dbDuel.defender_stats,
      status: dbDuel.status,
      roundLimit: dbDuel.round_limit || 3,
      currentRound: dbDuel.current_round || 1,
      currentTurn: dbDuel.current_turn || 'CHALLENGER',
      rounds: typeof dbDuel.rounds === "string" ? JSON.parse(dbDuel.rounds) : dbDuel.rounds || [],
      closesAt: dbDuel.closes_at || "",
      winner: dbDuel.winner
    };
  }
}
