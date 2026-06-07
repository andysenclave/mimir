// SheetProvider — prompt 23 (dialog-provider-pattern).
// Owns sheet state; renders the active sheet; exposes openSheet/closeSheet via context.
// Screen wraps content in <SheetProvider>; feature components call useSheet().

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { OrderConfirmationSheet } from '@/features/trading/OrderConfirmationSheet';
import type { SheetConfig } from './types';

interface SheetContextValue {
  openSheet: (config: NonNullable<SheetConfig>) => void;
  closeSheet: () => void;
}

const SheetContext = createContext<SheetContextValue | null>(null);

export function SheetProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [sheet, setSheet] = useState<SheetConfig>(null);
  const closeSheet = useCallback(() => setSheet(null), []);

  return (
    <SheetContext.Provider value={{ openSheet: setSheet, closeSheet }}>
      {children}

      {sheet?.type === 'orderConfirm' && (
        <OrderConfirmationSheet
          symbol={sheet.symbol}
          name={sheet.name}
          orderType={sheet.orderType}
          quantity={sheet.quantity}
          ltp={sheet.ltp}
          cashRemaining={sheet.cashRemaining}
          onConfirm={async () => {
            await sheet.onConfirm();
            closeSheet();
          }}
          onCancel={closeSheet}
        />
      )}
    </SheetContext.Provider>
  );
}

export function useSheet(): SheetContextValue {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error('useSheet must be used within SheetProvider');
  return ctx;
}
