import { renderOperatorChat, resolvePortfolioChatApiUrl } from '@magicborn/mb-cli-framework';

export async function runChatStubTui(): Promise<void> {
  await renderOperatorChat({ chatApiUrl: resolvePortfolioChatApiUrl() });
}
