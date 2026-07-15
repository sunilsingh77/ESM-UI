export interface JwtPayload {
  unique_name?: string;

  email?: string;

  role?: string | string[];

  exp?: number;

  iss?: string;

  aud?: string;

  nbf?: number;

  iat?: number;

  jti?: string;

  [key: string]: unknown;
}
