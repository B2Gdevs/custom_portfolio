import JSZip from 'jszip';
import { NextResponse } from 'next/server';
import { getMinimalPlanningTemplateFiles } from '@/lib/repo-planner/minimal-template-files';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const zip = new JSZip();
    for (const file of getMinimalPlanningTemplateFiles()) {
      zip.file(file.path, file.content);
    }

    const content = await zip.generateAsync({ type: 'nodebuffer' });
    return new NextResponse(new Uint8Array(content), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="repo-planner-minimal-template.zip"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
