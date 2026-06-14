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
  | {
      // MM-059 — sign-out confirmation. onConfirm clears tokens + routes to login.
      type: 'signOut';
      onConfirm: () => Promise<void> | void;
    }
  | {
      // MM-058 — generic destructive confirmation (e.g. delete account).
      type: 'confirm';
      title: string;
      message: string;
      confirmLabel: string;
      onConfirm: () => Promise<void> | void;
    }
  | null;
