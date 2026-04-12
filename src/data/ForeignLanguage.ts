import { SymbolCategory } from './SymbolCategory';
import { SymbolTableParser } from './SymbolTableParser';

/**
 * Holds the bundled foreign-language symbol definitions and parsed categories.
 *
 * The table is backed by plain-text source data and reparses itself whenever
 * the source is replaced.
 */
export class ForeignLanguage {
  /**
   * Default plain-text source for bundled foreign-language symbol categories.
   */
  static readonly sourceData = `
日語(平假名)=あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわゐゑをん
日語(平濁音)=がぎぐげござじずぜぞだぢづでどばぱびぴぶぷべぺぼぽ
日語(平小字)=ぁぃぅぇぉっゃゅょゎ
日語(片假名)=アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヰヱヲン
日語(片濁音)=ガギグゲゴザジズゼゾダヂヅデドバパビピブプベペボポヴ
日語(片小字)=ァィゥェォヵヶッャュョヮ
日語(片半角)=ｧｨｩｪｫｯｬｭｮｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦ
`;

  sourceData_ = ForeignLanguage.sourceData.trim();

  /**
   * Returns the raw foreign-language symbol source text.
   */
  get sourceData(): string {
    return this.sourceData_;
  }

  /**
   * Replaces the raw source text and reparses the category tree.
   *
   * @param value - The plain-text foreign-language symbol definition to parse.
   */
  set sourceData(value: string) {
    this.sourceData_ = value;
    this.tables_ = SymbolTableParser.parse(value);
  }

  tables_ = SymbolTableParser.parse(this.sourceData_);

  /**
   * Returns the parsed foreign-language symbol categories.
   */
  get tables(): (SymbolCategory | string)[] {
    return this.tables_;
  }
}
