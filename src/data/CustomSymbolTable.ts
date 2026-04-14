import { SymbolCategory } from './SymbolCategory';
import { SymbolTableParser } from './SymbolTableParser';

/**
 * Holds the built-in custom symbol definitions and their parsed category tree.
 *
 * The table starts with bundled source text and reparses itself whenever the
 * source data is replaced.
 */
export class CustomSymbolTable {
  /**
   * Default plain-text source for the bundled custom symbol categories.
   */
  static readonly sourceData = `
…
※
常用符號=，、。．？！；︰‧‥﹐﹒˙·“”〝〞‵′〃～＄％＠＆＃＊
左右括號=（）「」〔〕｛｝〈〉『』《》【】﹙﹚﹝﹞﹛﹜
上下括號=︵︶﹁﹂︹︺︷︸︿﹀﹃﹄︽︾︻︼
希臘字母=αβγδεζηθικλμνξοπρστυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ
數學符號=＋－＝≠≒√＜＞﹤﹥≦≧∩∪ˇ⊥∠∟⊿㏒㏑∫∮∵∴╳﹢
特殊圖形=↑↓←→↖↗↙↘㊣◎○●⊕⊙○●△▲☆★◇◆□■▽▼§￥〒￠￡※♀♂
Unicode=♨☀☁☂☃♠♥♣♦♩♪♫♬☺☻
單線框=├─┼┴┬┤┌┐╞═╪╡│▕└┘╭╮╰╯
雙線框=╔╦╗╠═╬╣╓╥╖╒╤╕║╚╩╝╟╫╢╙╨╜╞╪╡╘╧╛
填色方塊=＿ˍ▁▂▃▄▅▆▇█▏▎▍▌▋▊▉◢◣◥◤
線段=﹣﹦≡｜∣∥–︱—︳╴¯￣﹉﹊﹍﹎﹋﹌﹏︴∕﹨╱╲／＼
`;

  sourceData_ = CustomSymbolTable.sourceData.trim();

  /**
   * Returns the raw symbol-table source text.
   */
  get sourceData(): string {
    return this.sourceData_;
  }

  /**
   * Replaces the raw symbol-table source text and reparses the category tree.
   *
   * @param value - The plain-text symbol table definition to parse.
   */
  set sourceData(value: string) {
    this.sourceData_ = value;
    this.tables_ = SymbolTableParser.parse(value);
  }

  tables_ = SymbolTableParser.parse(this.sourceData_);

  /**
   * Returns the parsed symbol-category tree derived from the current source.
   */
  get tables(): (SymbolCategory | string)[] {
    return this.tables_;
  }
}
