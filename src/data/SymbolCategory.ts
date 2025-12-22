/**
 * Represents a symbol category.
 */
export class SymbolCategory {
  /** The ID of the symbol category. */
  readonly id: string;
  /** The name of the symbol category. */
  readonly name: string;
  /** The nodes of the symbol category. */
  readonly nodes: (SymbolCategory | string)[];

  constructor(args: { name: string; id: string; nodes: (SymbolCategory | string)[] }) {
    this.id = args.id;
    this.name = args.name;
    this.nodes = args.nodes;
  }
}
