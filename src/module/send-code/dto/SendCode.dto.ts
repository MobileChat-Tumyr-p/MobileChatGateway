import { IsEmail, IsString } from "class-validator";

export class SendCodeDTO {
  @IsEmail()
  @IsString()
  email: string
}
