 export type Box = {
  capacity?: { [key: string]: number };
  equipments?: any[];
  growth_items?: any[];
  limiteds?: any[];
  matatabis?: any[];
  materials?: any[];
  monument?: {
    augite?: any[];
    hr?: number;
    mlv?: { atk: number; def: number; hp: number; sp: number };
  };
  otomos?: any[];
  partners?: any[];
  payments?: any[];
  points?: any[];
  powers?: any[];
  zeny?: number;
};

export class BoxService {
  static addItem<T>(box: Box, field: keyof Box, item: T): void {
    const list = box[field] as T[];
    if (Array.isArray(list)) {
      list.push(item);
    } else {
      throw new Error(`Field '${field}' is not an array`);
    }
  }

  static removeItem<T>(box: Box, field: keyof Box, matcher: Partial<T>): void {
    const list = box[field] as T[];
    if (Array.isArray(list)) {
      box[field] = list.filter(item => {
        return !Object.entries(matcher).every(([k, v]) => (item as any)[k] === v);
      }) as any;
    } else {
      throw new Error(`Field '${field}' is not an array`);
    }
  }

  static incrementZeny(box: Box, amount: number): void {
    box.zeny += amount;
  }

  static updateMonumentLevel(box: Box, stat: keyof Box["monument"]["mlv"], amount: number): void {
    if (!box.monument.mlv.hasOwnProperty(stat)) {
      throw new Error(`Invalid monument stat: ${String(stat)}`);
    }
    box.monument.mlv[stat] += amount;
  }

  static setCapacity(box: Box, key: keyof Box["capacity"], value: number): void {
    box.capacity[key] = value;
  }
}