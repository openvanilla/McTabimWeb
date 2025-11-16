import { SymbolCategory } from './SymbolCategory';
import { SymbolTableParser } from './SymbolTableParser';

export class CustomSymbolTable {
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
