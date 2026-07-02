// Intelligence Engine - Multi-provider LLM Abstraction Layer for KAOS

export interface ILLMProvider {
  generateText(prompt: string, systemPrompt?: string): Promise<string>;
  generateJSON<T>(prompt: string, systemPrompt?: string): Promise<T>;
}

// 1. Ollama Provider (Official KAOS Local Engine)
export class OllamaProvider implements ILLMProvider {
  private baseUrl: string;
  private model: string;

  constructor() {
    // If n8n runs inside Docker, use host.docker.internal, otherwise localhost
    this.baseUrl = process.env.KAOS_OLLAMA_URL || "http://localhost:11434";
    this.model = process.env.KAOS_OLLAMA_MODEL || "llama3";
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          messages,
          stream: false,
          options: { temperature: 0.2 }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama responded with status: ${response.status}`);
      }

      const data = await response.json();
      return data.message?.content || "";
    } catch (err) {
      console.error("[Intelligence Engine] Ollama generateText error:", err);
      throw err;
    }
  }

  async generateJSON<T>(prompt: string, systemPrompt?: string): Promise<T> {
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          messages,
          stream: false,
          format: "json", // Instructs Ollama to return JSON
          options: { temperature: 0.1 }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama JSON responded with status: ${response.status}`);
      }

      const data = await response.json();
      const text = data.message?.content || "";
      return JSON.parse(text) as T;
    } catch (err) {
      console.error("[Intelligence Engine] Ollama generateJSON error:", err);
      throw err;
    }
  }
}

// 2. OpenAI Provider (Cloud Fallback)
export class OpenAIProvider implements ILLMProvider {
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || "";
    this.model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("OpenAI API key missing");
    }

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.2
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI responded with status: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";
    } catch (err) {
      console.error("[Intelligence Engine] OpenAI generateText error:", err);
      throw err;
    }
  }

  async generateJSON<T>(prompt: string, systemPrompt?: string): Promise<T> {
    if (!this.apiKey) {
      throw new Error("OpenAI API key missing");
    }

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          response_format: { type: "json_object" },
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI JSON responded with status: ${response.status}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || "";
      return JSON.parse(text) as T;
    } catch (err) {
      console.error("[Intelligence Engine] OpenAI generateJSON error:", err);
      throw err;
    }
  }
}

// 3. Provider Factory
export function getIntelligenceProvider(): ILLMProvider {
  const providerType = process.env.KAOS_AI_PROVIDER || "ollama";

  switch (providerType.toLowerCase()) {
    case "openai":
      return new OpenAIProvider();
    case "ollama":
    default:
      return new OllamaProvider();
  }
}
