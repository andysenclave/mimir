import { Module } from '@nestjs/common';

import { AuthModule } from '../modules/auth/auth.module';

import { MeResolver } from './me.resolver';
import { MeService } from './me.service';

@Module({
  imports: [AuthModule], // for LocalAuthGuard
  providers: [MeService, MeResolver],
})
export class MeModule {}
