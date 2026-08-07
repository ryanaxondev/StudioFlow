export type ProcessorContext = Readonly<{
  attempt: number;
  signal: AbortSignal;
}>;

export interface WorkerProcessor<TPayload = unknown> {
  readonly name: string;
  process(payload: TPayload, context: ProcessorContext): Promise<void>;
}
