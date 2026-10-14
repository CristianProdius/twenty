import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType('CreateAppStaticConnectionInput')
export class CreateAppStaticConnectionInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  providerName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  handle: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  displayName?: string;
}
