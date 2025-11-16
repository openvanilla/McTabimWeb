export class SymbolCategory {
  readonly id: string;
  readonly name: string;
  readonly nodes: (SymbolCategory | string)[];

  constructor(args: { name: string; id: string; nodes: (SymbolCategory | string)[] }) {
    this.id = args.id;
    this.name = args.name;
    this.nodes = args.nodes;
  }
}
