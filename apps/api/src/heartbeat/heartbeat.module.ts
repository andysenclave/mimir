import { Module } from '@nestjs/common';

import { PubSubModule } from '../pubsub/pubsub.module';
import { HeartbeatResolver } from './heartbeat.resolver';

@Module({
  imports: [PubSubModule],
  providers: [HeartbeatResolver],
})
export class HeartbeatModule {}
