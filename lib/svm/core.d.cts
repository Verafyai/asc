declare const SVM: {
  assemble(text: string): Uint8Array;
  run(prog: Uint8Array, memIn: Uint8Array, cuLimit?: number): { status: string; r0: bigint; cu: number; regs: bigint[]; mem: Uint8Array };
  u64s(words: (number | bigint)[]): Uint8Array;
};
export = SVM;
