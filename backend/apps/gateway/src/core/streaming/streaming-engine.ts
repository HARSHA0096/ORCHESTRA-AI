export class StreamingEngine {
  async prepareStream(_input: unknown): Promise<{ enabled: boolean }> {
    return { enabled: true };
  }

  async handleChunk(_chunk: unknown): Promise<void> {
    return;
  }

  async cancel(): Promise<void> {
    return;
  }
}
