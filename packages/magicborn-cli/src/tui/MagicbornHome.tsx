import React from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { resolveCliTheme } from '@magicborn/mb-cli-framework';

/** Default interactive home when `magicborn` is run with no args (TTY, not MAGICBORN_PLAIN). */
export function MagicbornHome() {
  const { exit } = useApp();
  const theme = resolveCliTheme();

  useInput((input, key) => {
    if (input === 'q' || key.escape || (key.ctrl && input === 'c')) {
      exit();
    }
  });

  return (
    <Box flexDirection="column" width={72}>
      <Box
        borderStyle="round"
        borderColor={theme.border}
        flexDirection="column"
        paddingX={1}
        paddingY={0}
        marginBottom={1}
      >
        <Text bold color={theme.primary}>
          magicborn
        </Text>
        <Text color={theme.muted}>Operator CLI — q / Esc to quit · run magicborn --help for full list</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold color={theme.asset}>
          Local / packaging
        </Text>
        <Text color={theme.description}> book · planning-pack · listen · style · model</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold color={theme.payload}>
          Payload CMS
        </Text>
        <Text color={theme.description}> payload collections · payload app generate (scaffold)</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold color={theme.vendor}>
          Vendors
        </Text>
        <Text color={theme.description}> vendor list · vendor &lt;id&gt; … · vendor use &lt;id&gt;</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold color={theme.openai}>
          APIs
        </Text>
        <Text color={theme.description}> openai · chat (assistant-ui scaffold)</Text>
      </Box>

      <Box borderStyle="single" borderColor={theme.border} paddingX={1}>
        <Text color={theme.muted}>global-tooling-03 · Ink + mb-cli-framework theme</Text>
      </Box>
    </Box>
  );
}
