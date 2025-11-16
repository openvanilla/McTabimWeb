export interface InputTable {
  cname: string;
  ename: string | undefined;
  cincount:
    | {
        big5F: number | undefined;
        big5LF: number | undefined;
        big5Other: number | undefined;
        big5S: number | undefined;
        bopomofo: number | undefined;
        cjk: number | undefined;
        cjkCI: number | undefined;
        cjkCIS: number | undefined;
        cjkExtA: number | undefined;
        cjkExtB: number | undefined;
        cjkExtC: number | undefined;
        cjkExtD: number | undefined;
        cjkExtE: number | undefined;
        cjkExtF: number | undefined;
        cjkOther: number | undefined;
        phrases: number | undefined;
        privateuse: number | undefined;
        totalchardefs: number | undefined;
      }
    | undefined;
  chardefs: { [key: string]: string[] };
  keynames: { [key: string]: string };
  privateuse: { [key: string]: string[] };
  selkey: string;
}
