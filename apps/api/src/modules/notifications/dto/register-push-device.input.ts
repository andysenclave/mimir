// MM-018 — registerPushDevice input.

import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

const PLATFORMS = ['IOS', 'ANDROID', 'WEB'] as const;
type Platform = (typeof PLATFORMS)[number];

@InputType('RegisterPushDeviceInput')
export class RegisterPushDeviceInput {
  @Field(() => String, { description: 'Expo push token (ExponentPushToken[...]).' })
  @IsString()
  @MinLength(8)
  expoPushToken!: string;

  @Field(() => String, { description: 'IOS | ANDROID | WEB' })
  @IsEnum(PLATFORMS as unknown as object, {
    message: `platform must be one of ${PLATFORMS.join(', ')}`,
  })
  platform!: Platform;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  appVersion?: string;
}
