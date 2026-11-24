import { ChatSession } from "@google/generative-ai";
import { OrderState, createChat } from "./chatService";

export interface SessionData {
  sessionId: string;
  chat: ChatSession;
  orderState: OrderState;
  lastActive: number;
}

class SessionManager {
  private sessions = new Map<string, SessionData>();
  private readonly TTL_MS = 30 * 60 * 1000; // 30 minutos

  constructor() {
    // Limpeza periódica de sessões inativas para evitar consumo de memória RAM
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000);
  }

  public getOrCreateSession(sessionId: string, apiKey: string): SessionData {
    let session = this.sessions.get(sessionId);

    if (!session) {
      session = {
        sessionId,
        chat: createChat(apiKey),
        orderState: {
          hasPizza: false,
          hasBeverage: false,
          hasDessert: false,
        },
        lastActive: Date.now(),
      };
      this.sessions.set(sessionId, session);
    } else {
      session.lastActive = Date.now();
    }

    return session;
  }

  public touch(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActive = Date.now();
    }
  }

  private cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [id, session] of this.sessions.entries()) {
      if (now - session.lastActive > this.TTL_MS) {
        this.sessions.delete(id);
      }
    }
  }
}

export const sessionManager = new SessionManager();
