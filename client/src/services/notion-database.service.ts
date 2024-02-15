import type { DatabaseObjectResponse } from '@notionhq/client/build/src/api-endpoints';

export function getTitleOfDatabase(database: DatabaseObjectResponse): string | undefined {
  return database.title?.[0].plain_text;
}
