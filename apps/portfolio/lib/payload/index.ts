import 'server-only';
import type { Payload } from 'payload';

let payloadPromise: Promise<Payload> | null = null;

export async function getPayloadClient() {
  if (!payloadPromise) {
    payloadPromise = Promise.all([import('payload'), import('@/payload.config')]).then(
      ([payloadModule, configModule]) =>
        payloadModule.getPayload({
          config: configModule.default,
        }),
    );
  }

  return payloadPromise;
}
