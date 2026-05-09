import { Equals, IsBoolean, IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email!: string;

  // ADR-0001 §1: min 10 chars, ≥1 letter + ≥1 digit.
  @IsString()
  @MinLength(10)
  @Matches(/(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'Password must contain at least one letter and one digit',
  })
  password!: string;

  // CLAUDE.md §19 — DPDP age 18+ attestation required.
  @IsBoolean()
  @Equals(true, { message: 'Age attestation (18+) is required' })
  ageAttested!: true;

  @IsBoolean()
  @Equals(true, { message: 'Terms of Service must be accepted' })
  termsAccepted!: true;
}
