export type Box = {
  capacity?: { [key: string]: number }
  equipments?: unknown[]
  growth_items?: unknown[]
  limiteds?: unknown[]
  matatabis?: unknown[]
  materials?: unknown[]
  monument?: {
    augite?: unknown[]
    hr?: number
    mlv?: { atk: number; def: number; hp: number; sp: number }
  }
  otomos?: unknown[]
  partners?: unknown[]
  payments?: unknown[]
  points?: unknown[]
  powers?: unknown[]
  zeny?: number
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

  static removeItem<T extends Record<string, unknown>>(box: Box, field: keyof Box, matcher: Partial<T>): void {
    const list = box[field] as T[];
    if (Array.isArray(list)) {
      (box as Record<string, unknown>)[field as string] = list.filter(item => {
        return !Object.entries(matcher).every(([k, v]) => item[k] === v);
      });
    } else {
      throw new Error(`Field '${field}' is not an array`);
    }
  }

  static incrementZeny(box: Box, amount: number): void {
    box.zeny = (box.zeny || 0) + amount;
  }

  static updateMonumentLevel(box: Box, stat: 'atk' | 'def' | 'hp' | 'sp', amount: number): void {
    if (!box.monument?.mlv || !box.monument.mlv.hasOwnProperty(stat)) {
      throw new Error(`Invalid monument stat: ${String(stat)}`);
    }
    box.monument.mlv[stat] += amount;
  }

  static setCapacity(box: Box, key: string, value: number): void {
    if (!box.capacity) {
      throw new Error('Box capacity is undefined');
    }
    box.capacity[key] = value;
  }
}
