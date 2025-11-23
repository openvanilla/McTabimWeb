import 'dayjs/locale/ja';
import 'dayjs/locale/zh-tw';

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(localizedFormat);

export default class DateHelper {
  static getYearBase(year: number): [number, number] {
    const base: number = year < 4 ? 60 - ((year * -1 + 2) % 60) : (year - 3) % 60;
    return [base % 10, base % 12];
  }

  static ganzhi(year: number): string {
    const gan: string[] = [...['癸', '甲', '乙', '丙', '丁'], ...['戊', '己', '庚', '辛', '壬']];
    const zhi: string[] = [
      ...['亥', '子', '丑', '寅', '卯', '辰'],
      ...['巳', '午', '未', '申', '酉', '戌'],
    ];
    const [ganBase, zhiBase] = DateHelper.getYearBase(year);
    return gan[ganBase] + zhi[zhiBase] + '年';
  }

  static chineseZodiac(year: number): string {
    const gan = [...['水', '木', '木', '火', '火'], ...['土', '土', '金', '金', '水']];
    const zhi = [...['豬', '鼠', '牛', '虎', '兔', '龍'], ...['蛇', '馬', '羊', '猴', '雞', '狗']];
    const [ganBase, zhiBase] = DateHelper.getYearBase(year);
    return gan[ganBase] + zhi[zhiBase] + '年';
  }

  static fillDateEntries(): string[] {
    const now = dayjs();
    return [
      now.locale('zh-tw').format('YYYY年M月D日'),
      '民國' + now.subtract(1911, 'year').year() + '年' + now.locale('zh-tw').format('M月D日'),
      now.locale('zh-tw').format('YYYY/M/D'),
      now.locale('en').format('M/D/YYYY'),
      now.locale('en').format('MMM D, YYYY'), // Dec 25, 2025 format
      now.locale('zh-tw').format('西元YYYY年'),
      now.locale('zh-tw').format('YYYY年'),
      '民國' + now.subtract(1911, 'year').year() + '年',
      now.locale('zh-tw').format('LTS'),
      now.locale('zh-tw').format('LT'),
      DateHelper.ganzhi(now.year()),
      DateHelper.chineseZodiac(now.year()),
    ];
  }
}
