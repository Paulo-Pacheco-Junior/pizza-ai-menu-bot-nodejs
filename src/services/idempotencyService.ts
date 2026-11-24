export class IdempotencyService {
  private processedMessages = new Map<string, string>();
  private inFlightMessages = new Set<string>();
  private readonly defaultTtlMs: number;

  constructor(defaultTtlMs = 2 * 60 * 1000) {
    this.defaultTtlMs = defaultTtlMs;
  }

  public isProcessed(messageId: string): boolean {
    return this.processedMessages.has(messageId);
  }

  public getResponse(messageId: string): string | undefined {
    return this.processedMessages.get(messageId);
  }

  public isInFlight(messageId: string): boolean {
    return this.inFlightMessages.has(messageId);
  }

  public startProcessing(messageId: string): boolean {
    if (this.inFlightMessages.has(messageId)) {
      return false;
    }
    this.inFlightMessages.add(messageId);
    return true;
  }

  public finishProcessing(
    messageId: string,
    response: string,
    ttlMs = this.defaultTtlMs
  ): void {
    this.inFlightMessages.delete(messageId);
    this.processedMessages.set(messageId, response);

    setTimeout(() => {
      this.processedMessages.delete(messageId);
    }, ttlMs);
  }

  public cancelProcessing(messageId: string): void {
    this.inFlightMessages.delete(messageId);
  }
}

export const idempotencyService = new IdempotencyService();
