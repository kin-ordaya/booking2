import { IsEmail} from 'class-validator';

export class sendEmailDto {
  @IsEmail({}, { each: true })
  recipients: string[];
}
