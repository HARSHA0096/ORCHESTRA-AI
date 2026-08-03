export class RetryEngine {
  async execute<T>(operation: () => Promise<T>, retries = 1, delayMs = 50): Promise<T> {
    let attempt = 0;
    while (true) {
      try {
        return await operation();
      } catch (error) {
        if (attempt >= retries) throw error;
        attempt += 1;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
}
