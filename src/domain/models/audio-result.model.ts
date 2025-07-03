export class AudioResult {
  constructor(
    public readonly script: string,
    public readonly audioPath: string,
    public readonly duration?: number
  ) {}
}
