import { SymbolCategory } from './SymbolCategory';
import { SymbolTableParser } from './SymbolTableParser';

export class ForeignLanguage {
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
  get sourceData(): string {
    return this.sourceData_;
  }
  set sourceData(value: string) {
    this.sourceData_ = value;
    this.tables_ = SymbolTableParser.parse(value);
  }

  tables_ = SymbolTableParser.parse(this.sourceData_);

  get tables(): (SymbolCategory | string)[] {
    return this.tables_;
  }
}
