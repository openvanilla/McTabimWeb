import { SymbolCategory } from './SymbolCategory';
import { SymbolTableParser } from './SymbolTableParser';

export class ForeignLanguage {
  static readonly sourceData =
    '日語(平假名)=あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわゐゑをん\n' +
    '日語(平濁音)=がぎぐげござじずぜぞだぢづでどばぱびぴぶぷべぺぼぽ\n' +
    '日語(平小字)=ぁぃぅぇぉっゃゅょゎ\n' +
    '日語(片假名)=アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヰヱヲン\n' +
    '日語(片濁音)=ガギグゲゴザジズゼゾダヂヅデドバパビピブプベペボポヴ\n' +
    '日語(片小字)=ァィゥェォヵヶッャュョヮ\n' +
    '日語(片半角)=ｧｨｩｪｫｯｬｭｮｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ\n';

  sourceData_ = ForeignLanguage.sourceData.trim();
  get sourceData(): string {
    return this.sourceData_;
  }
  set sourceData(value: string) {
    this.sourceData_ = value;
    this.tables_ = SymbolTableParser.parse(value);
  }

  tables_ = SymbolTableParser.parse(this.sourceData_);

  get tables(): SymbolCategory[] {
    return this.tables_;
  }
}
