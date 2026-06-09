// MM-041 — UpdateNotificationPreferences input DTO.
// All fields are optional — partial update semantics (only provided fields change).

import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

@InputType()
export class UpdateNotificationPreferencesInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  streakEnabled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  budgetEnabled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  priceAlertsEnabled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  portfolioEvtEnabled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  educationalEnabled?: boolean;

  /** HH:MM 24h format, IST. */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'quietHoursStart must be HH:MM (24h)' })
  quietHoursStart?: string;

  /** HH:MM 24h format, IST. */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'quietHoursEnd must be HH:MM (24h)' })
  quietHoursEnd?: string;

  /** 1–3 notifications per day. */
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  dailyCap?: number;
}
