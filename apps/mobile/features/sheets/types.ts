// Discriminated union of all bottom sheet configs (prompt 23).
// Every sheet in the app is represented here. The SheetProvider renders the
// active sheet; feature components call openSheet() with the matching config.

export type SheetConfig =
  | {
      type: 'orderConfirm';
      symbol: string;
      name: string | null | undefined;
      orderType: 'BUY' | 'SELL';
      quantity: number;
      ltp: number;
      cashRemaining: number;
      onConfirm: () => Promise<void>;
    }
  | null;
