import type { Box } from '../types/game';
export type { Box };

export function addItem(box: Box, field: keyof Box, item: unknown): void {
  const list = box[field] as unknown[];
  if (Array.isArray(list)) {
    list.push(item);
  } else {
    throw new Error(`Field '${field}' is not an array`);
  }
}

export function removeItem<T extends Record<string, number | string>>(
  box: Box,
  field: keyof Box,
  matcher: Partial<T>,
): void {
  const boxRecord = box as Record<string, T[] | undefined>;
  const list = boxRecord[field as string];
  if (Array.isArray(list)) {
    boxRecord[field as string] = list.filter((item) => {
      return !Object.entries(matcher).every(([k, v]) => item[k] === v);
    });
  } else {
    throw new Error(`Field '${field}' is not an array`);
  }
}

export function incrementZeny(box: Box, amount: number): void {
  box.zeny = (box.zeny || 0) + amount;
}

export function updateMonumentLevel(
  box: Box,
  stat: 'atk' | 'def' | 'hp' | 'sp',
  amount: number,
): void {
  if (!box.monument?.mlv || !Object.prototype.hasOwnProperty.call(box.monument.mlv, stat)) {
    throw new Error(`Invalid monument stat: ${stat}`);
  }
  box.monument.mlv[stat] += amount;
}

export function setCapacity(box: Box, key: string, value: number): void {
  if (!box.capacity) {
    throw new Error('Box capacity is undefined');
  }
  box.capacity[key] = value;
}
