'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react').then((m) => m.default), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-border bg-card/40 p-8 text-sm text-muted-foreground">
      Loading API explorer…
    </div>
  ),
});

export function ApiDocsSwagger() {
  const url = useMemo(() => '/api/openapi', []);

  return (
    <div className="api-docs-swagger min-h-[70vh] rounded-xl border border-border bg-background shadow-sm [&_.swagger-ui]:text-foreground">
      <SwaggerUI
        url={url}
        docExpansion="list"
        defaultModelsExpandDepth={1}
        persistAuthorization
        tryItOutEnabled
      />
    </div>
  );
}
