// KAOS Domain Event Definitions & Dispatcher Interface

export type KaosEventType =
  | 'ArticlePublished'
  | 'CommentCreated'
  | 'DuelStarted'
  | 'DuelFinished'
  | 'UserRegistered'
  | 'ArticleLiked'
  | 'CommentReported';

export interface KaosEvent<T = any> {
  id: string;
  type: KaosEventType;
  timestamp: string;
  payload: T;
}

export interface IEventDispatcher {
  dispatch<T>(type: KaosEventType, payload: T): Promise<void>;
}

// Simple local or console-based dispatcher fallback, which later hooks into n8n Webhooks.
export class EventDispatcher implements IEventDispatcher {
  private n8nWebhookUrl: string;

  constructor() {
    this.n8nWebhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "";
  }

  async dispatch<T>(type: KaosEventType, payload: T): Promise<void> {
    const event: KaosEvent<T> = {
      id: crypto.randomUUID(),
      type,
      timestamp: new Date().toISOString(),
      payload
    };

    console.log(`[KAOS Event] Dispatching ${type}:`, event);

    // Forward to n8n if webhook URL is configured
    if (this.n8nWebhookUrl) {
      try {
        await fetch(this.n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event)
        });
      } catch (err) {
        console.error(`[KAOS Event] Failed to send event ${type} to n8n:`, err);
      }
    }
  }
}
