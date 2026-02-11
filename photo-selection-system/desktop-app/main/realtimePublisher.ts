// main/realtimePublisher.ts
import * as log from 'electron-log';
import Ably from 'ably';
import { appConfig } from '../config/env';

let ablyClient: Ably.Rest | null = null;
let channelName: string | null = null;

function getAblyClient(): Ably.Rest | null {
  if (ablyClient) return ablyClient;

  const apiKey = appConfig.ably?.apiKey;
  const token = appConfig.ably?.token;

  if (!apiKey && !token) {
    return null;
  }

  ablyClient = new Ably.Rest({ key: apiKey, token });
  channelName = appConfig.ably?.channel || 'processing-logs';

  return ablyClient;
}

export async function publishProcessingUpdate(payload: Record<string, unknown>) {
  try {
    const client = getAblyClient();
    if (!client || !channelName) return;

    const channel = client.channels.get(channelName);
    await channel.publish('processing-log', payload);
  } catch (error) {
    log.warn('Failed to publish processing update:', error);
  }
}
