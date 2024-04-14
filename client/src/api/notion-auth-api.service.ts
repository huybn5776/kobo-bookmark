import type { OauthTokenResponse } from '@notionhq/client/build/src/api-endpoints';
import axios from 'axios';

export async function getNotionTokenByCode(code: string, redirectUri: string): Promise<OauthTokenResponse> {
  const data = { code, redirectUri };
  const response = await axios.post<OauthTokenResponse>('/api/notion/oauth', data);
  return response.data;
}
