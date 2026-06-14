import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('UserDevice')
export class UserDeviceEntity {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  platform!: string;

  @Field(() => String)
  registeredAt!: string;
}
