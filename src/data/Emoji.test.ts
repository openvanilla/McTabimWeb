import { EmojiTable } from './Emoji';
import { SymbolCategory } from './SymbolCategory';

describe('EmojiTable', () => {
  let emojiTable: EmojiTable;

  beforeEach(() => {
    emojiTable = new EmojiTable();
  });

  describe('initialization', () => {
    it('should create an EmojiTable instance', () => {
      expect(emojiTable).toBeInstanceOf(EmojiTable);
    });

    it('should have a tables property', () => {
      expect(emojiTable.tables).toBeDefined();
      expect(Array.isArray(emojiTable.tables)).toBe(true);
    });

    it('should have 6 main categories', () => {
      expect(emojiTable.tables.length).toBe(6);
    });
  });

  describe('emoji categories structure', () => {
    it('should have emoticons as first category', () => {
      const emoticons = emojiTable.tables[0];
      expect(emoticons).toBeInstanceOf(SymbolCategory);
      expect(emoticons.name).toBe('表情符號');
      expect(emoticons.id).toBe('emoticons');
    });

    it('should have emoticons with 4 subcategories', () => {
      const emoticons = emojiTable.tables[0];
      expect(emoticons.nodes.length).toBe(4);
    });

    it('should have pictographs as second category', () => {
      const pictographs = emojiTable.tables[1];
      expect(pictographs).toBeInstanceOf(SymbolCategory);
      expect(pictographs.name).toBe('圖形符號');
      expect(pictographs.id).toBe('pictographs');
    });

    it('should have pictographs with 38 subcategories', () => {
      const pictographs = emojiTable.tables[1];
      expect(pictographs.nodes.length).toBe(38);
    });

    it('should have miscellaneous as third category', () => {
      const miscellaneous = emojiTable.tables[2];
      expect(miscellaneous).toBeInstanceOf(SymbolCategory);
      expect(miscellaneous.name).toBe('其它符號');
      expect(miscellaneous.id).toBe('miscellaneous');
    });

    it('should have dingbats as fourth category', () => {
      const dingbats = emojiTable.tables[3];
      expect(dingbats).toBeInstanceOf(SymbolCategory);
      expect(dingbats.name).toBe('雜錦符號');
      expect(dingbats.id).toBe('dingbats');
    });

    it('should have transport as fifth category', () => {
      const transport = emojiTable.tables[4];
      expect(transport).toBeInstanceOf(SymbolCategory);
      expect(transport.name).toBe('交通運輸');
      expect(transport.id).toBe('transport');
    });

    it('should have modifiercolor as sixth category', () => {
      const modifiercolor = emojiTable.tables[5];
      expect(modifiercolor).toBeInstanceOf(SymbolCategory);
      expect(modifiercolor.name).toBe('調色盤');
      expect(modifiercolor.id).toBe('modifiercolor');
    });
  });

  describe('emoticons category', () => {
    let emoticons: SymbolCategory;

    beforeEach(() => {
      emoticons = emojiTable.tables[0];
    });

    it('should have faces subcategory', () => {
      const faces = emoticons.nodes[0] as SymbolCategory;
      expect(faces).toBeInstanceOf(SymbolCategory);
      expect(faces.name).toBe('表情');
      expect(faces.id).toBe('faces');
    });

    it('should have catfaces subcategory', () => {
      const catfaces = emoticons.nodes[1] as SymbolCategory;
      expect(catfaces).toBeInstanceOf(SymbolCategory);
      expect(catfaces.name).toBe('貓咪');
      expect(catfaces.id).toBe('catfaces');
    });

    it('should have animal subcategory', () => {
      const animal = emoticons.nodes[2] as SymbolCategory;
      expect(animal).toBeInstanceOf(SymbolCategory);
      expect(animal.name).toBe('動物');
      expect(animal.id).toBe('animal');
    });

    it('should have gesture subcategory', () => {
      const gesture = emoticons.nodes[3] as SymbolCategory;
      expect(gesture).toBeInstanceOf(SymbolCategory);
      expect(gesture.name).toBe('手勢');
      expect(gesture.id).toBe('gesture');
    });
  });

  describe('pictographs category', () => {
    let pictographs: SymbolCategory;

    beforeEach(() => {
      pictographs = emojiTable.tables[1];
    });

    it('should have portraitandrole subcategory', () => {
      const portraitandrole = pictographs.nodes[0] as SymbolCategory;
      expect(portraitandrole.name).toBe('人物');
      expect(portraitandrole.id).toBe('portraitandrole');
    });

    it('should have food subcategory', () => {
      const food = pictographs.nodes.find(
        (node) => (node as SymbolCategory).id === 'food',
      ) as SymbolCategory;
      expect(food).toBeDefined();
      expect(food.name).toBe('食物與餐具');
    });

    it('should have sport subcategory', () => {
      const sport = pictographs.nodes.find(
        (node) => (node as SymbolCategory).id === 'sport',
      ) as SymbolCategory;
      expect(sport).toBeDefined();
      expect(sport.name).toBe('體育');
    });
  });

  describe('dingbats category', () => {
    let dingbats: SymbolCategory;

    beforeEach(() => {
      dingbats = emojiTable.tables[3];
    });

    it('should have miscellaneous subcategory', () => {
      const miscellaneous = dingbats.nodes[0] as SymbolCategory;
      expect(miscellaneous.name).toBe('雜錦');
      expect(miscellaneous.id).toBe('miscellaneous');
    });

    it('should have arrows subcategory', () => {
      const arrows = dingbats.nodes.find(
        (node) => (node as SymbolCategory).id === 'arrows',
      ) as SymbolCategory;
      expect(arrows).toBeDefined();
      expect(arrows.name).toBe('箭頭');
    });

    it('should have arithmetics subcategory', () => {
      const arithmetics = dingbats.nodes.find(
        (node) => (node as SymbolCategory).id === 'arithmetics',
      ) as SymbolCategory;
      expect(arithmetics).toBeDefined();
      expect(arithmetics.name).toBe('數學符號');
    });
  });

  describe('transport category', () => {
    let transport: SymbolCategory;

    beforeEach(() => {
      transport = emojiTable.tables[4];
    });

    it('should have 4 subcategories', () => {
      expect(transport.nodes.length).toBe(4);
    });

    it('should have vehicles subcategory', () => {
      const vehicles = transport.nodes[0] as SymbolCategory;
      expect(vehicles.name).toBe('交通工具');
      expect(vehicles.id).toBe('vehicles');
    });

    it('should have trafficsigns subcategory', () => {
      const trafficsigns = transport.nodes[1] as SymbolCategory;
      expect(trafficsigns.name).toBe('交通標誌');
      expect(trafficsigns.id).toBe('trafficsigns');
    });
  });

  describe('modifiercolor category', () => {
    let modifiercolor: SymbolCategory;

    beforeEach(() => {
      modifiercolor = emojiTable.tables[5];
    });

    it('should have nodes array', () => {
      expect(Array.isArray(modifiercolor.nodes)).toBe(true);
      expect(modifiercolor.nodes.length).toBeGreaterThan(0);
    });

    it('nodes should be strings (color codes)', () => {
      if (modifiercolor.nodes.length > 0) {
        const firstNode = modifiercolor.nodes[0];
        expect(typeof firstNode === 'string').toBe(true);
      }
    });
  });

  describe('category consistency', () => {
    it('all main categories should be SymbolCategory instances', () => {
      emojiTable.tables.forEach((category) => {
        expect(category).toBeInstanceOf(SymbolCategory);
      });
    });

    it('all main categories should have unique IDs', () => {
      const ids = emojiTable.tables.map((c) => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('all main categories should have names', () => {
      emojiTable.tables.forEach((category) => {
        expect(category.name).toBeTruthy();
        expect(typeof category.name).toBe('string');
      });
    });

    it('all main categories should have nodes', () => {
      emojiTable.tables.forEach((category) => {
        expect(Array.isArray(category.nodes)).toBe(true);
        expect(category.nodes.length).toBeGreaterThan(0);
      });
    });
  });

  describe('nested category structure', () => {
    it('emoticons subcategories should be SymbolCategory instances', () => {
      const emoticons = emojiTable.tables[0];
      emoticons.nodes.forEach((node) => {
        expect(node).toBeInstanceOf(SymbolCategory);
      });
    });

    it('pictographs subcategories should be SymbolCategory instances', () => {
      const pictographs = emojiTable.tables[1];
      pictographs.nodes.forEach((node) => {
        expect(node).toBeInstanceOf(SymbolCategory);
      });
    });

    it('emoticon subcategories should have emoji strings', () => {
      const emoticons = emojiTable.tables[0];
      const faces = emoticons.nodes[0] as SymbolCategory;
      expect(Array.isArray(faces.nodes)).toBe(true);
      if (faces.nodes.length > 0) {
        const firstEmoji = faces.nodes[0];
        expect(typeof firstEmoji === 'string').toBe(true);
      }
    });
  });

  describe('singleton behavior', () => {
    it('should create new instance each time', () => {
      const table1 = new EmojiTable();
      const table2 = new EmojiTable();
      expect(table1).not.toBe(table2);
    });

    it('should have identical structure in different instances', () => {
      const table1 = new EmojiTable();
      const table2 = new EmojiTable();
      expect(table1.tables.length).toBe(table2.tables.length);
      expect(table1.tables[0].name).toBe(table2.tables[0].name);
    });
  });
});
