// MM-037 — Watchlist-domain typed exceptions.
// Thrown by MeService; caught by the global exception filter.
// Prompt 17: never expose stack traces or internal messages to clients.

import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';

export class WatchlistLimitException extends HttpException {
  constructor() {
    super(
      {
        message: 'Watchlist is full. You can track up to 50 stocks.',
        code: 'WATCHLIST_LIMIT',
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

export class WatchlistItemNotFoundException extends NotFoundException {
  constructor(symbol: string) {
    super({
      message: `${symbol} is not in your watchlist.`,
      code: 'WATCHLIST_ITEM_NOT_FOUND',
    });
  }
}
