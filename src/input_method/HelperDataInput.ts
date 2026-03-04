import 'dayjs/locale/ja';
import 'dayjs/locale/zh-tw';

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(localizedFormat);

/**
 * A utility class for date-related operations and traditional calendar
 * calculations.
 */
export default class DateHelper {
  /**
   * Calculates the base values for the Heavenly Stems and Earthly Branches
   * based on the given year.
   * @param year The year to calculate the base for.
   * @returns A tuple containing the base for the Heavenly Stems (0-9) and the
   *   base for the Earthly Branches (0-11).
   */
  static getYearBase(year: number): [number, number] {
    const base: number = year < 4 ? 60 - ((year * -1 + 2) % 60) : (year - 3) % 60;
    return [base % 10, base % 12];
  }

  /**
   * Calculates the Heavenly Stem and Earthly Branch name for a given year.
   * @param year The year to calculate the name for.
   * @returns The Heavenly Stem and Earthly Branch name in Chinese characters.
   */
  static ganzhi(year: number): string {
    const gan: string[] = [...['癸', '甲', '乙', '丙', '丁'], ...['戊', '己', '庚', '辛', '壬']];
    const zhi: string[] = [
      ...['亥', '子', '丑', '寅', '卯', '辰'],
      ...['巳', '午', '未', '申', '酉', '戌'],
    ];
    const [ganBase, zhiBase] = DateHelper.getYearBase(year);
    return gan[ganBase] + zhi[zhiBase] + '年';
  }

  /**
   * Calculates the Chinese zodiac animal name for a given year.
   * @param year The year to calculate the zodiac animal for.
   * @returns The Chinese zodiac animal name in Chinese characters.
   */
  static chineseZodiac(year: number): string {
    const gan = [...['水', '木', '木', '火', '火'], ...['土', '土', '金', '金', '水']];
    const zhi = [...['豬', '鼠', '牛', '虎', '兔', '龍'], ...['蛇', '馬', '羊', '猴', '雞', '狗']];
    const [ganBase, zhiBase] = DateHelper.getYearBase(year);
    return gan[ganBase] + zhi[zhiBase] + '年';
  }

  /**
   * Generates a list of date-related entries including Gregorian dates,
   * Republic of China calendar dates, times, and traditional Chinese calendar
   * representations.
   * @returns An array of strings containing various date and time formats.
   */
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
