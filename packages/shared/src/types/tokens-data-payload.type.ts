import { UserPayload } from './user-payload.type';

export type TokensDataPayload = {
  accessToken: string;
  refreshToken: string;
  tokenId: string;
};
export type UserWithTokensDataPayload = UserPayload & { tokensData: TokensDataPayload };
