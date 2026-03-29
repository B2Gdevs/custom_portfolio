import { NextResponse } from 'next/server';

/**
 * RepoPlanner chat tab expects POST /api/ai/planning-chat.
 * Wire to your model provider here, or use the standalone RepoPlanner app for full chat.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: 'Planning chat is not configured on this deployment.',
      hint: 'Implement POST /api/ai/planning-chat with your LLM, or run the RepoPlanner web app from github.com/MagicbornStudios/RepoPlanner with REPOPLANNER_PROJECT_ROOT set to this monorepo.',
    },
    { status: 501 },
  );
}
