import { AxiosError } from 'axios';

export function handleNotionApiError(error: Error): string {
  let { message } = error;
  if (error instanceof AxiosError) {
    message = error.response?.data.message || message;
  }
  return message;
}
