import 'dayjs/locale/zh-tw';

import { describe, expect, it, jest } from '@jest/globals';
import dayjs from 'dayjs';

import DateHelper from './HelperDataInput';

describe('DateHelper', () => {
  it('getYearBase returns correct base for positive years', () => {
    expect(DateHelper.getYearBase(2024)).toEqual([1, 5]);
    expect(DateHelper.getYearBase(2000)).toEqual([7, 5]);
  });

  it('getYearBase returns correct base for years less than 4', () => {
    expect(DateHelper.getYearBase(1)).toEqual([9, 11]);
    expect(DateHelper.getYearBase(0)).toEqual([8, 10]);
    expect(DateHelper.getYearBase(-1)).toEqual([7, 9]);
  });

  it('ganzhi returns correct string for given year', () => {
    expect(DateHelper.ganzhi(2024)).toMatch(/^[甲乙丙丁戊己庚辛壬癸][亥子丑寅卯辰巳午未申酉戌]年$/);
    expect(DateHelper.ganzhi(2000)).toMatch(/年$/);
  });

  it('chineseZodiac returns correct string for given year', () => {
    expect(DateHelper.chineseZodiac(2024)).toMatch(/^[水木火土金豬鼠牛虎兔龍蛇馬羊猴雞狗]+年$/);
    expect(DateHelper.chineseZodiac(2000)).toMatch(/年$/);
  });

  it('fillDateEntries returns expected date formats', () => {
    const entries = DateHelper.fillDateEntries();
    expect(entries.length).toBe(12);
    expect(entries[0]).toMatch(/^\d{4}年\d{1,2}月\d{1,2}日$/);
    expect(entries[1]).toMatch(/^民國\d+年\d{1,2}月\d{1,2}日$/);
    expect(entries[2]).toMatch(/^\d{4}\/\d{1,2}\/\d{1,2}$/);
    expect(entries[3]).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/);
    expect(entries[4]).toMatch(/^[A-Za-z]{3} \d{1,2}, \d{4}$/);
    expect(entries[5]).toMatch(/^西元\d{4}年$/);
    expect(entries[6]).toMatch(/^\d{4}年$/);
    expect(entries[7]).toMatch(/^民國\d+年$/);
    expect(entries[8]).toMatch(/^\d{1,2}:\d{2}:\d{2}/); // LTS
    expect(entries[9]).toMatch(/^\d{1,2}:\d{2}/); // LT
    expect(entries[10]).toMatch(/年$/); // ganzhi
    expect(entries[11]).toMatch(/年$/); // chineseZodiac
  });

  it('fillDateEntries uses current year for ganzhi and chineseZodiac', () => {
    const nowYear = dayjs().year();
    expect(DateHelper.fillDateEntries()[10]).toBe(DateHelper.ganzhi(nowYear));
    expect(DateHelper.fillDateEntries()[11]).toBe(DateHelper.chineseZodiac(nowYear));
  });
});
