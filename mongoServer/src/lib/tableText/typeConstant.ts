export interface TableTextType {
  tid: string;
  xid: string;
  m: string;
  n: string;
  s: number[];
  i: {
    xiid: string;
    p: {
      p: {
        l: number;
        t: number;
      };
      s: {
        x: number;
        y: number;
      };
      r: number;
    };
    es: {
      "0": string;
      "1": string;
      "2": string;
      "3": string;
      "4": string;
      "5": number;
    };
  }[];
}
