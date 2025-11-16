import src from './symbols/emoji.json';

export class EmojiCategory {
  readonly id: string;
  readonly name: string;
  readonly nodes: string[] | EmojiCategory[];

  constructor(args: { name: string; id: string; nodes: string[] | EmojiCategory[] }) {
    this.id = args.id;
    this.name = args.name;
    this.nodes = args.nodes;
  }
}

export class EmojiTable {
  tables: EmojiCategory[] = (() => {
    const emoticons = new EmojiCategory({
      name: '表情符號',
      id: 'emoticons',
      nodes: [
        new EmojiCategory({ name: '表情', id: 'faces', nodes: src.emoticons.faces }),
        new EmojiCategory({ name: '貓咪', id: 'catfaces', nodes: src.emoticons.catfaces }),
        new EmojiCategory({ name: '動物', id: 'animal', nodes: src.emoticons.animal }),
        new EmojiCategory({ name: '手勢', id: 'gesture', nodes: src.emoticons.gesture }),
      ],
    });

    const pictographs = new EmojiCategory({
      name: '圖形符號',
      id: 'pictographs',
      nodes: [
        new EmojiCategory({
          name: '人物',
          id: 'portraitandrole',
          nodes: src.pictographs.portraitandrole,
        }),
        new EmojiCategory({ name: '動物', id: 'animal', nodes: src.pictographs.animal }),
        new EmojiCategory({ name: '植物', id: 'plant', nodes: src.pictographs.plant }),
        new EmojiCategory({ name: '浪漫', id: 'romance', nodes: src.pictographs.romance }),
        new EmojiCategory({ name: '愛心', id: 'heart', nodes: src.pictographs.heart }),
        new EmojiCategory({
          name: '漫畫風格',
          id: 'comicstyle',
          nodes: src.pictographs.comicstyle,
        }),
        new EmojiCategory({ name: '聊天泡泡', id: 'bubble', nodes: src.pictographs.bubble }),
        new EmojiCategory({
          name: '天氣與風景',
          id: 'weatherandlandscape',
          nodes: src.pictographs.weatherandlandscape,
        }),
        new EmojiCategory({ name: '地球', id: 'globe', nodes: src.pictographs.globe }),
        new EmojiCategory({
          name: '日月星辰',
          id: 'moonsunandstar',
          nodes: src.pictographs.moonsunandstar,
        }),
        new EmojiCategory({ name: '食物與餐具', id: 'food', nodes: src.pictographs.food }),
        new EmojiCategory({
          name: '水果與蔬菜',
          id: 'fruitandvegetable',
          nodes: src.pictographs.fruitandvegetable,
        }),
        new EmojiCategory({ name: '飲料', id: 'beverage', nodes: src.pictographs.beverage }),
        new EmojiCategory({ name: '慶典', id: 'celebration', nodes: src.pictographs.celebration }),
        new EmojiCategory({ name: '音樂', id: 'musical', nodes: src.pictographs.musical }),
        new EmojiCategory({
          name: '娛樂',
          id: 'entertainment',
          nodes: src.pictographs.entertainment,
        }),
        new EmojiCategory({ name: '遊戲', id: 'game', nodes: src.pictographs.game }),
        new EmojiCategory({ name: '體育', id: 'sport', nodes: src.pictographs.sport }),
        new EmojiCategory({
          name: '建築與地標',
          id: 'buildingandmap',
          nodes: src.pictographs.buildingandmap,
        }),
        new EmojiCategory({ name: '旗標', id: 'flag', nodes: src.pictographs.flag }),
        new EmojiCategory({
          name: '其它',
          id: 'miscellaneous',
          nodes: src.pictographs.miscellaneous,
        }),
        new EmojiCategory({ name: '臉部', id: 'facialparts', nodes: src.pictographs.facialparts }),
        new EmojiCategory({ name: '手部', id: 'hand', nodes: src.pictographs.hand }),
        new EmojiCategory({ name: '服飾', id: 'clothing', nodes: src.pictographs.clothing }),
        new EmojiCategory({
          name: '個人護理',
          id: 'personalcare',
          nodes: src.pictographs.personalcare,
        }),
        new EmojiCategory({ name: '醫療', id: 'medical', nodes: src.pictographs.medical }),
        new EmojiCategory({ name: '滿分', id: 'schoolgrade', nodes: src.pictographs.schoolgrade }),
        new EmojiCategory({ name: '金錢', id: 'money', nodes: src.pictographs.money }),
        new EmojiCategory({ name: '辦公', id: 'office', nodes: src.pictographs.office }),
        new EmojiCategory({
          name: '通訊',
          id: 'communication',
          nodes: src.pictographs.communication,
        }),
        new EmojiCategory({
          name: '影音',
          id: 'audioandvideo',
          nodes: src.pictographs.audioandvideo,
        }),
        new EmojiCategory({ name: '宗教', id: 'religious', nodes: src.pictographs.religious }),
        new EmojiCategory({
          name: '使用者介面',
          id: 'userinterface',
          nodes: src.pictographs.userinterface,
        }),
        new EmojiCategory({
          name: '文字指標',
          id: 'wordswitharrows',
          nodes: src.pictographs.wordswitharrows,
        }),
        new EmojiCategory({ name: '工具', id: 'tool', nodes: src.pictographs.tool }),
        new EmojiCategory({
          name: '幾何形狀',
          id: 'geometricshapes',
          nodes: src.pictographs.geometricshapes,
        }),
        new EmojiCategory({ name: '時鐘', id: 'clockface', nodes: src.pictographs.clockface }),
        new EmojiCategory({ name: '電腦', id: 'computer', nodes: src.pictographs.computer }),
      ],
    });

    const miscellaneous = new EmojiCategory({
      name: '其它符號',
      id: 'miscellaneous',
      nodes: [
        new EmojiCategory({
          name: '天氣與占星',
          id: 'weathers',
          nodes: src.miscellaneous.weathers,
        }),
        new EmojiCategory({
          name: '其它符號',
          id: 'miscellaneous',
          nodes: src.miscellaneous.miscellaneous,
        }),
        new EmojiCategory({ name: '棋牌與博弈', id: 'chess', nodes: src.miscellaneous.chess }),
        new EmojiCategory({
          name: '指向符號',
          id: 'pointinghand',
          nodes: src.miscellaneous.pointinghand,
        }),
        new EmojiCategory({
          name: '警告標誌',
          id: 'warningsigns',
          nodes: src.miscellaneous.warningsigns,
        }),
        new EmojiCategory({ name: '醫療符號', id: 'medical', nodes: src.miscellaneous.medical }),
        new EmojiCategory({
          name: '宗教與政治',
          id: 'religiousandpolitical',
          nodes: src.miscellaneous.religiousandpolitical,
        }),
        new EmojiCategory({
          name: '易經八掛',
          id: 'yijingtrigram',
          nodes: src.miscellaneous.yijingtrigram,
        }),
        new EmojiCategory({
          name: '表情符號',
          id: 'emoticons',
          nodes: src.miscellaneous.emoticons,
        }),
        new EmojiCategory({ name: '星座符號', id: 'zodiacal', nodes: src.miscellaneous.zodiacal }),
        new EmojiCategory({ name: '音樂符號', id: 'musical', nodes: src.miscellaneous.musical }),
        new EmojiCategory({
          name: '十字架',
          id: 'syriaccross',
          nodes: src.miscellaneous.syriaccross,
        }),
        new EmojiCategory({
          name: '資源回收筒',
          id: 'recycling',
          nodes: src.miscellaneous.recycling,
        }),
        new EmojiCategory({ name: '地圖指標', id: 'map', nodes: src.miscellaneous.map }),
        new EmojiCategory({ name: '性別符號', id: 'gender', nodes: src.miscellaneous.gender }),
        new EmojiCategory({
          name: '圈號與星號',
          id: 'circlesandpentagram',
          nodes: src.miscellaneous.circlesandpentagram,
        }),
        new EmojiCategory({
          name: '系譜符號',
          id: 'genealogical',
          nodes: src.miscellaneous.genealogical,
        }),
        new EmojiCategory({ name: '體育運動', id: 'sport', nodes: src.miscellaneous.sport }),
        new EmojiCategory({
          name: '交通標誌',
          id: 'trafficsigns',
          nodes: src.miscellaneous.trafficsigns,
        }),
      ],
    });

    const dingbats = new EmojiCategory({
      name: '雜錦符號',
      id: 'dingbats',
      nodes: [
        new EmojiCategory({
          name: '雜錦',
          id: 'miscellaneous',
          nodes: src.dingbats.miscellaneous,
        }),
        new EmojiCategory({ name: '十字架', id: 'crosses', nodes: src.dingbats.crosses }),
        new EmojiCategory({
          name: '星號與雪花',
          id: 'starsandsnows',
          nodes: src.dingbats.starsandsnows,
        }),
        new EmojiCategory({ name: '紋飾', id: 'ornaments', nodes: src.dingbats.fleurons }),
        new EmojiCategory({
          name: '標點符號',
          id: 'punctuation',
          nodes: src.dingbats.punctuationmarks,
        }),
        new EmojiCategory({ name: '括號', id: 'brackets', nodes: src.dingbats.brackets }),
        new EmojiCategory({ name: '數字', id: 'digits', nodes: src.dingbats.digits }),
        new EmojiCategory({ name: '箭頭', id: 'arrows', nodes: src.dingbats.arrows }),
        new EmojiCategory({
          name: '數學符號',
          id: 'arithmetics',
          nodes: src.dingbats.arithmetics,
        }),
      ],
    });

    const transport = new EmojiCategory({
      name: '交通運輸',
      id: 'transport',
      nodes: [
        new EmojiCategory({ name: '交通工具', id: 'vehicles', nodes: src.transport.vehicles }),
        new EmojiCategory({
          name: '交通標誌',
          id: 'trafficsigns',
          nodes: src.transport.trafficsigns,
        }),
        new EmojiCategory({
          name: '旅遊住宿',
          id: 'accommodation',
          nodes: src.transport.accommodation,
        }),
        new EmojiCategory({
          name: '其它',
          id: 'miscellaneous',
          nodes: src.transport.miscellaneous,
        }),
      ],
    });

    const modifierColor = new EmojiCategory({
      name: '調色盤',
      id: 'modifiercolor',
      nodes: src.modifiercolor,
    });

    return [emoticons, pictographs, miscellaneous, dingbats, transport, modifierColor];
  })();
}
