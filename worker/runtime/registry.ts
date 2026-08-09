import type { WorkerProcessor } from "./processor";

export class ProcessorRegistry {
  readonly #processors = new Map<string, WorkerProcessor>();

  register(processor: WorkerProcessor): void {
    if (this.#processors.has(processor.name)) {
      throw new Error(`Worker processor already registered: ${processor.name}`);
    }

    this.#processors.set(processor.name, processor);
  }

  get(eventType: string): WorkerProcessor | undefined {
    return this.#processors.get(eventType);
  }

  names(): readonly string[] {
    return [...this.#processors.keys()].sort();
  }
}
