import { Module } from '@nestjs/common';

import { HeartbeatResolver } from './heartbeat.resolver';

@Module({
  providers: [HeartbeatResolver],
})
export class HeartbeatModule {}
