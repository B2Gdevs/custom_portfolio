var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// lib/payload/collections/ragSources.ts
var ragSources;
var init_ragSources = __esm({
  "lib/payload/collections/ragSources.ts"() {
    "use strict";
    ragSources = {
      slug: "rag-sources",
      admin: {
        useAsTitle: "title",
        group: "RAG"
      },
      fields: [
        {
          name: "sourceId",
          type: "text",
          required: true,
          unique: true,
          index: true
        },
        {
          name: "title",
          type: "text",
          required: true,
          index: true
        },
        {
          name: "description",
          type: "textarea"
        },
        {
          name: "kind",
          type: "select",
          required: true,
          options: [
            { label: "Doc", value: "doc" },
            { label: "Project", value: "project" },
            { label: "Blog", value: "blog" },
            { label: "Magicborn", value: "magicborn" }
          ]
        },
        {
          name: "scope",
          type: "text",
          required: true,
          index: true
        },
        {
          name: "slug",
          type: "text",
          required: true,
          index: true
        },
        {
          name: "sourcePath",
          type: "text",
          required: true
        },
        {
          name: "publicUrl",
          type: "text",
          required: true
        },
        {
          name: "checksum",
          type: "text",
          required: true,
          index: true
        },
        {
          name: "lastContentUpdatedAt",
          type: "date"
        },
        {
          name: "lastIndexedAt",
          type: "date"
        },
        {
          name: "currentRunId",
          type: "text",
          index: true
        },
        {
          name: "isDeleted",
          type: "checkbox",
          required: true,
          defaultValue: false,
          index: true
        },
        {
          name: "meta",
          type: "json"
        }
      ]
    };
  }
});

// lib/payload/collections/ragChunks.ts
var ragChunks;
var init_ragChunks = __esm({
  "lib/payload/collections/ragChunks.ts"() {
    "use strict";
    ragChunks = {
      slug: "rag-chunks",
      admin: {
        useAsTitle: "vectorKey",
        group: "RAG",
        defaultColumns: ["vectorKey", "sourceId", "chunkIndex", "heading", "isActive"]
      },
      fields: [
        {
          name: "vectorKey",
          type: "text",
          required: true,
          unique: true,
          index: true
        },
        {
          name: "source",
          type: "relationship",
          relationTo: "rag-sources",
          required: true,
          index: true
        },
        {
          name: "run",
          type: "relationship",
          relationTo: "rag-ingest-runs",
          required: true,
          index: true
        },
        {
          name: "sourceId",
          type: "text",
          required: true,
          index: true
        },
        {
          name: "sourceTitle",
          type: "text",
          required: true
        },
        {
          name: "sourceKind",
          type: "text",
          required: true
        },
        {
          name: "sourceScope",
          type: "text",
          required: true
        },
        {
          name: "sourceSlug",
          type: "text",
          required: true,
          index: true
        },
        {
          name: "sourcePath",
          type: "text",
          required: true
        },
        {
          name: "publicUrl",
          type: "text",
          required: true
        },
        {
          name: "chunkIndex",
          type: "number",
          required: true,
          index: true
        },
        {
          name: "heading",
          type: "text"
        },
        {
          name: "anchor",
          type: "text"
        },
        {
          name: "content",
          type: "textarea",
          required: true
        },
        {
          name: "tokenCount",
          type: "number",
          required: true
        },
        {
          name: "contentChecksum",
          type: "text",
          required: true,
          index: true
        },
        {
          name: "embeddingModel",
          type: "text",
          required: true
        },
        {
          name: "embeddingDimensions",
          type: "number",
          required: true
        },
        {
          name: "embedding",
          type: "json",
          required: true,
          admin: {
            position: "sidebar"
          }
        },
        {
          name: "isActive",
          type: "checkbox",
          required: true,
          defaultValue: false,
          index: true
        }
      ]
    };
  }
});

// lib/payload/collections/ragIngestRuns.ts
var ragIngestRuns;
var init_ragIngestRuns = __esm({
  "lib/payload/collections/ragIngestRuns.ts"() {
    "use strict";
    ragIngestRuns = {
      slug: "rag-ingest-runs",
      admin: {
        useAsTitle: "status",
        group: "RAG",
        defaultColumns: ["status", "isActive", "indexedSourceCount", "indexedChunkCount", "updatedAt"]
      },
      fields: [
        {
          name: "status",
          type: "select",
          required: true,
          options: [
            { label: "Running", value: "running" },
            { label: "Completed", value: "completed" },
            { label: "Failed", value: "failed" }
          ],
          defaultValue: "running",
          index: true
        },
        {
          name: "startedAt",
          type: "date",
          required: true
        },
        {
          name: "finishedAt",
          type: "date"
        },
        {
          name: "committedAt",
          type: "date"
        },
        {
          name: "isActive",
          type: "checkbox",
          required: true,
          defaultValue: false,
          index: true
        },
        {
          name: "indexedSourceCount",
          type: "number",
          required: true,
          defaultValue: 0
        },
        {
          name: "indexedChunkCount",
          type: "number",
          required: true,
          defaultValue: 0
        },
        {
          name: "reusedChunkCount",
          type: "number",
          required: true,
          defaultValue: 0
        },
        {
          name: "deletedSourceCount",
          type: "number",
          required: true,
          defaultValue: 0
        },
        {
          name: "triggeredBy",
          type: "text"
        },
        {
          name: "notes",
          type: "textarea"
        },
        {
          name: "config",
          type: "json"
        },
        {
          name: "error",
          type: "json"
        }
      ]
    };
  }
});

// lib/rag/config.ts
import fs from "node:fs";
import path from "node:path";
function isPortfolioAppRoot(candidate) {
  return fs.existsSync(path.join(candidate, "app")) && fs.existsSync(path.join(candidate, "content")) && fs.existsSync(path.join(candidate, "package.json"));
}
function getPortfolioAppRoot() {
  const cwd = process.cwd();
  if (isPortfolioAppRoot(cwd)) {
    return cwd;
  }
  const nestedAppRoot = path.join(cwd, "apps", "portfolio");
  if (isPortfolioAppRoot(nestedAppRoot)) {
    return nestedAppRoot;
  }
  return cwd;
}
function resolveFilePath(input) {
  return path.isAbsolute(input) ? input : path.resolve(getPortfolioAppRoot(), input);
}
function getRagDatabaseFilePath() {
  const explicitPath = process.env.RAG_SQLITE_PATH?.trim() || process.env.DATABASE_PATH?.trim() || process.env.DATABASE_FILE?.trim();
  if (explicitPath) {
    return resolveFilePath(explicitPath);
  }
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (databaseUrl?.startsWith("file:")) {
    return resolveFilePath(databaseUrl.slice("file:".length));
  }
  return path.join(getPortfolioAppRoot(), DEFAULT_DB_FILE);
}
function getPayloadDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (databaseUrl) {
    return databaseUrl;
  }
  return `file:${getRagDatabaseFilePath().replace(/\\/g, "/")}`;
}
function getEmbeddingModel() {
  return process.env.OPENAI_EMBEDDING_MODEL?.trim() || DEFAULT_EMBEDDING_MODEL;
}
function getEmbeddingDimensions() {
  const parsed = Number(process.env.OPENAI_EMBEDDING_DIMENSIONS?.trim());
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return DEFAULT_EMBEDDING_DIMENSIONS;
}
var DEFAULT_DB_FILE, DEFAULT_EMBEDDING_MODEL, DEFAULT_EMBEDDING_DIMENSIONS;
var init_config = __esm({
  "lib/rag/config.ts"() {
    "use strict";
    DEFAULT_DB_FILE = "portfolio.db";
    DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";
    DEFAULT_EMBEDDING_DIMENSIONS = 1536;
  }
});

// payload.config.ts
import { buildConfig } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
var payload_config_default;
var init_payload_config = __esm({
  "payload.config.ts"() {
    "use strict";
    init_ragSources();
    init_ragChunks();
    init_ragIngestRuns();
    init_config();
    payload_config_default = buildConfig({
      secret: process.env.PAYLOAD_SECRET?.trim() || "dev-payload-secret",
      db: sqliteAdapter({
        client: {
          url: getPayloadDatabaseUrl()
        }
      }),
      collections: [ragSources, ragChunks, ragIngestRuns]
    });
  }
});

// lib/payload/index.ts
import { getPayload } from "payload";
function getPayloadClient() {
  if (!payloadPromise) {
    payloadPromise = getPayload({
      config: payload_config_default
    });
  }
  return payloadPromise;
}
var payloadPromise;
var init_payload = __esm({
  "lib/payload/index.ts"() {
    "use strict";
    init_payload_config();
    payloadPromise = null;
  }
});

// lib/rag/chunking.ts
import { createHash } from "node:crypto";
function slugify(value) {
  return value.toLowerCase().replace(/[`*_~]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function stripMarkdown(text) {
  return text.replace(/```[\s\S]*?```/g, " ").replace(/`([^`]+)`/g, "$1").replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/<[^>]+>/g, " ").replace(/^\s*>\s?/gm, "").replace(/^\s*[-*+]\s+/gm, "").replace(/^\s*\d+\.\s+/gm, "").replace(/\|/g, " ").replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
function sha(value) {
  return createHash("sha256").update(value).digest("hex");
}
function estimateTokenCount(value) {
  return Math.max(1, Math.round(value.trim().split(/\s+/).length * 1.2));
}
function splitIntoSections(document) {
  const lines = document.body.split("\n");
  const sections = [];
  let currentHeading = document.title;
  let currentAnchor = "";
  let buffer = [];
  const flush = () => {
    const body = stripMarkdown(buffer.join("\n"));
    if (!body) {
      buffer = [];
      return;
    }
    sections.push({
      heading: currentHeading,
      anchor: currentAnchor,
      body
    });
    buffer = [];
  };
  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flush();
      currentHeading = stripMarkdown(headingMatch[2]).trim() || document.title;
      currentAnchor = slugify(currentHeading);
      continue;
    }
    buffer.push(line);
  }
  flush();
  return sections.length ? sections : [
    {
      heading: document.title,
      anchor: "",
      body: stripMarkdown(document.body)
    }
  ];
}
function splitSectionIntoChunks(section) {
  if (section.body.length <= TARGET_CHARS) {
    return [section.body];
  }
  const paragraphs = section.body.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const chunks = [];
  let current = "";
  for (const paragraph of paragraphs) {
    const nextValue = current ? `${current}

${paragraph}` : paragraph;
    if (nextValue.length > TARGET_CHARS && current.length >= MIN_CHARS) {
      chunks.push(current);
      current = paragraph;
      continue;
    }
    current = nextValue;
  }
  if (current) {
    chunks.push(current);
  }
  return chunks.length ? chunks : [section.body];
}
function chunkRagSource(document) {
  const sections = splitIntoSections(document);
  const chunks = [];
  let chunkIndex = 0;
  for (const section of sections) {
    for (const chunkBody of splitSectionIntoChunks(section)) {
      const content = section.heading ? `${section.heading}

${chunkBody}`.trim() : chunkBody.trim();
      if (!content) {
        continue;
      }
      chunks.push({
        chunkIndex,
        heading: section.heading,
        anchor: section.anchor,
        content,
        tokenCount: estimateTokenCount(content),
        contentChecksum: sha(content)
      });
      chunkIndex += 1;
    }
  }
  return chunks;
}
var TARGET_CHARS, MIN_CHARS;
var init_chunking = __esm({
  "lib/rag/chunking.ts"() {
    "use strict";
    TARGET_CHARS = 1400;
    MIN_CHARS = 350;
  }
});

// lib/rag/embeddings.ts
async function embedTexts(texts) {
  if (!texts.length) {
    return [];
  }
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required for RAG embeddings.");
  }
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      input: texts,
      model: getEmbeddingModel(),
      dimensions: getEmbeddingDimensions()
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Embeddings request failed: ${response.status} ${errorText}`);
  }
  const body = await response.json();
  return body.data.sort((a, b) => a.index - b.index).map((entry) => entry.embedding);
}
var init_embeddings = __esm({
  "lib/rag/embeddings.ts"() {
    "use strict";
    init_config();
  }
});

// lib/rag/search-db.ts
import Database from "better-sqlite3";
import * as sqliteVec from "sqlite-vec";
function ensureSearchSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS rag_search_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS rag_chunk_fts USING fts5(
      content,
      title,
      heading,
      source_scope,
      source_kind,
      public_url UNINDEXED,
      source_path UNINDEXED,
      source_id UNINDEXED,
      anchor UNINDEXED,
      run_id UNINDEXED,
      tokenize = 'porter unicode61 remove_diacritics 2'
    );
  `);
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS rag_chunk_vectors USING vec0(
      chunk_id INTEGER PRIMARY KEY,
      run_id TEXT PARTITION KEY,
      embedding FLOAT[${getEmbeddingDimensions()}]
    );
  `);
}
function getDb() {
  if (!searchDb) {
    searchDb = new Database(getRagDatabaseFilePath());
    searchDb.pragma("journal_mode = WAL");
    sqliteVec.load(searchDb);
    ensureSearchSchema(searchDb);
  }
  return searchDb;
}
function setActiveRunId(runId) {
  const db = getDb();
  db.prepare(`
    INSERT INTO rag_search_state(key, value)
    VALUES ('active_run_id', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(runId);
}
function replaceRunChunks(runId, chunks) {
  const db = getDb();
  const clearFts = db.prepare("DELETE FROM rag_chunk_fts WHERE run_id = ?");
  const clearVec = db.prepare("DELETE FROM rag_chunk_vectors WHERE run_id = ?");
  const insertFts = db.prepare(`
    INSERT INTO rag_chunk_fts(
      rowid,
      content,
      title,
      heading,
      source_scope,
      source_kind,
      public_url,
      source_path,
      source_id,
      anchor,
      run_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertVec = db.prepare(`
    INSERT INTO rag_chunk_vectors(chunk_id, run_id, embedding)
    VALUES (?, ?, ?)
  `);
  const transaction = db.transaction((rows) => {
    clearFts.run(runId);
    clearVec.run(runId);
    for (const row of rows) {
      insertFts.run(
        row.chunkId,
        row.content,
        row.title,
        row.heading,
        row.sourceScope,
        row.sourceKind,
        row.publicUrl,
        row.sourcePath,
        row.sourceId,
        row.anchor,
        row.runId
      );
      insertVec.run(row.chunkId, row.runId, new Float32Array(row.embedding));
    }
  });
  transaction(chunks);
}
function clearRun(runId) {
  const db = getDb();
  db.prepare("DELETE FROM rag_chunk_fts WHERE run_id = ?").run(runId);
  db.prepare("DELETE FROM rag_chunk_vectors WHERE run_id = ?").run(runId);
}
function pruneInactiveRuns(activeRunId) {
  const db = getDb();
  db.prepare("DELETE FROM rag_chunk_fts WHERE run_id != ?").run(activeRunId);
  db.prepare("DELETE FROM rag_chunk_vectors WHERE run_id != ?").run(activeRunId);
}
var searchDb;
var init_search_db = __esm({
  "lib/rag/search-db.ts"() {
    "use strict";
    init_config();
    searchDb = null;
  }
});

// lib/content.ts
import fs2 from "fs";
import path2 from "path";
import matter from "gray-matter";
function getContentFiles(type) {
  const typeDir = path2.join(contentDirectory, type);
  if (!fs2.existsSync(typeDir)) {
    return [];
  }
  const files = [];
  function walkDir(dir, baseDir = typeDir) {
    const entries = fs2.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path2.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath, baseDir);
      } else if (entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))) {
        const relativePath = path2.relative(baseDir, fullPath);
        files.push(relativePath);
      }
    }
  }
  walkDir(typeDir);
  return files;
}
function getContentBySlug(type, slug) {
  const typeDir = path2.join(contentDirectory, type);
  const files = getContentFiles(type);
  const file = files.find((f) => {
    const fileSlug = f.replace(/\.(md|mdx)$/, "").replace(/\\/g, "/");
    return fileSlug === slug;
  });
  if (!file)
    return null;
  const filePath = path2.join(typeDir, file);
  const fileContents = fs2.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);
  const stats = fs2.statSync(filePath);
  const fileModifiedDate = stats.mtime.toISOString().split("T")[0];
  return {
    meta: {
      ...data,
      slug,
      // Use file modification date if no date in frontmatter
      date: data.date || fileModifiedDate,
      // Use file modification date if no updated in frontmatter
      updated: data.updated || fileModifiedDate
    },
    content
  };
}
function getDateTimestamp(dateString) {
  if (!dateString)
    return 0;
  const timestamp = new Date(dateString).getTime();
  return isNaN(timestamp) ? 0 : timestamp;
}
function getAllContent(type) {
  const files = getContentFiles(type);
  return files.map((file) => {
    const slug = file.replace(/\.(md|mdx)$/, "").replace(/\\/g, "/");
    const content = getContentBySlug(type, slug);
    if (!content)
      return null;
    return {
      meta: content.meta,
      slug
    };
  }).filter((item) => item !== null).sort((a, b) => {
    const dateA = a.meta.updated ? getDateTimestamp(a.meta.updated) : getDateTimestamp(a.meta.date);
    const dateB = b.meta.updated ? getDateTimestamp(b.meta.updated) : getDateTimestamp(b.meta.date);
    return dateB - dateA;
  });
}
var contentDirectory;
var init_content = __esm({
  "lib/content.ts"() {
    "use strict";
    contentDirectory = path2.join(process.cwd(), "content");
  }
});

// lib/rag/source-documents.ts
import { createHash as createHash2 } from "node:crypto";
function hashContent(value) {
  return createHash2("sha256").update(value).digest("hex");
}
function isSearchableDocSlug(slug) {
  const leaf = slug.split("/").at(-1) ?? slug;
  return !EXCLUDED_DOC_LEAF_SLUGS.has(leaf);
}
function getDocKind(slug) {
  return slug.startsWith("magicborn/") ? "magicborn" : "doc";
}
function getDocScope(slug) {
  return slug.startsWith("magicborn/") ? "magicborn" : slug.split("/")[0] ?? "docs";
}
function getPublicUrl(type, slug) {
  if (type === "docs") {
    return `/docs/${slug}`;
  }
  if (type === "projects") {
    return `/projects/${slug}`;
  }
  return `/blog/${slug}`;
}
function getSourcePath(type, slug) {
  return `apps/portfolio/content/${type}/${slug}.mdx`;
}
function buildDocument(type, slug) {
  if (type === "docs" && !isSearchableDocSlug(slug)) {
    return null;
  }
  const item = getContentBySlug(type, slug);
  if (!item) {
    return null;
  }
  const kind = type === "docs" ? getDocKind(slug) : type === "projects" ? "project" : "blog";
  const scope = type === "docs" ? getDocScope(slug) : type === "projects" ? "projects" : "blog";
  return {
    sourceId: `${type}:${slug}`,
    title: item.meta.title,
    description: item.meta.description ?? "",
    kind,
    scope,
    slug,
    sourcePath: getSourcePath(type, slug),
    publicUrl: getPublicUrl(type, slug),
    updatedAt: item.meta.updated ?? item.meta.date ?? (/* @__PURE__ */ new Date()).toISOString(),
    checksum: hashContent(
      JSON.stringify({
        meta: item.meta,
        content: item.content
      })
    ),
    body: item.content,
    meta: item.meta
  };
}
function getRagSourceDocuments() {
  const documents = [];
  for (const slug of getAllContent("docs").map((entry) => entry.slug)) {
    const doc = buildDocument("docs", slug);
    if (doc) {
      documents.push(doc);
    }
  }
  for (const slug of getAllContent("projects").map((entry) => entry.slug)) {
    const project = buildDocument("projects", slug);
    if (project) {
      documents.push(project);
    }
  }
  for (const slug of getAllContent("blog").map((entry) => entry.slug)) {
    const post = buildDocument("blog", slug);
    if (post) {
      documents.push(post);
    }
  }
  return documents.sort((a, b) => a.sourceId.localeCompare(b.sourceId));
}
var EXCLUDED_DOC_LEAF_SLUGS;
var init_source_documents = __esm({
  "lib/rag/source-documents.ts"() {
    "use strict";
    init_content();
    EXCLUDED_DOC_LEAF_SLUGS = /* @__PURE__ */ new Set([
      "planning-docs",
      "state",
      "task-registry",
      "errors-and-attempts",
      "decisions",
      "requirements",
      "roadmap",
      "global-planning",
      "implementation-plan"
    ]);
  }
});

// lib/rag/ingest.ts
var ingest_exports = {};
__export(ingest_exports, {
  ingestRagCorpus: () => ingestRagCorpus
});
function serializeError(error) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }
  return {
    message: String(error)
  };
}
function normalizeText(value) {
  return typeof value === "string" ? value : "";
}
function normalizeNumber(value) {
  return typeof value === "number" ? value : 0;
}
async function setChunkActiveState(payload, runId, isActive) {
  const chunks = await payload.find({
    collection: "rag-chunks",
    where: {
      run: {
        equals: runId
      }
    },
    limit: 5e3,
    pagination: false,
    depth: 0
  });
  for (const chunk of chunks.docs) {
    await payload.update({
      collection: "rag-chunks",
      id: chunk.id,
      data: {
        isActive
      }
    });
  }
}
async function ingestRagCorpus(options = {}) {
  const payload = await getPayloadClient();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const run = await payload.create({
    collection: "rag-ingest-runs",
    data: {
      status: "running",
      startedAt: now,
      triggeredBy: options.triggeredBy ?? "script",
      notes: options.notes ?? "",
      config: {
        embeddingModel: getEmbeddingModel(),
        embeddingDimensions: getEmbeddingDimensions()
      }
    }
  });
  const runDocumentId = run.id;
  const runPartitionKey = String(run.id);
  try {
    const sourceSnapshot = getRagSourceDocuments();
    const existingSources = await payload.find({
      collection: "rag-sources",
      limit: 500,
      pagination: false,
      depth: 0
    });
    const activeRuns = await payload.find({
      collection: "rag-ingest-runs",
      where: {
        isActive: {
          equals: true
        }
      },
      limit: 1,
      sort: "-startedAt",
      depth: 0
    });
    const activeRun = activeRuns.docs[0];
    const activeRunDocumentId = activeRun?.id;
    const existingSourceById = new Map(
      existingSources.docs.map((source) => [String(source.sourceId), source])
    );
    const currentSourceIds = new Set(sourceSnapshot.map((source) => source.sourceId));
    let deletedSources = 0;
    for (const staleSource of existingSources.docs) {
      const sourceId = String(staleSource.sourceId);
      if (currentSourceIds.has(sourceId) || staleSource.isDeleted) {
        continue;
      }
      await payload.update({
        collection: "rag-sources",
        id: staleSource.id,
        data: {
          isDeleted: true,
          currentRunId: runPartitionKey,
          lastIndexedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
      deletedSources += 1;
    }
    const previousChunks = activeRunDocumentId ? await payload.find({
      collection: "rag-chunks",
      where: {
        run: {
          equals: activeRunDocumentId
        }
      },
      limit: 5e3,
      pagination: false,
      depth: 0
    }) : { docs: [] };
    const previousChunksBySourceId = /* @__PURE__ */ new Map();
    for (const chunk of previousChunks.docs) {
      const sourceId = String(chunk.sourceId);
      const current = previousChunksBySourceId.get(sourceId) ?? [];
      current.push(chunk);
      previousChunksBySourceId.set(sourceId, current);
    }
    const searchRows = [];
    let indexedSources = 0;
    let indexedChunks = 0;
    let reusedChunks = 0;
    for (const source of sourceSnapshot) {
      indexedSources += 1;
      const existingSource = existingSourceById.get(source.sourceId);
      const sourceDoc = existingSource ? await payload.update({
        collection: "rag-sources",
        id: existingSource.id,
        data: {
          sourceId: source.sourceId,
          title: source.title,
          description: source.description,
          kind: source.kind,
          scope: source.scope,
          slug: source.slug,
          sourcePath: source.sourcePath,
          publicUrl: source.publicUrl,
          checksum: source.checksum,
          lastContentUpdatedAt: source.updatedAt,
          lastIndexedAt: (/* @__PURE__ */ new Date()).toISOString(),
          currentRunId: runPartitionKey,
          isDeleted: false,
          meta: source.meta
        }
      }) : await payload.create({
        collection: "rag-sources",
        data: {
          sourceId: source.sourceId,
          title: source.title,
          description: source.description,
          kind: source.kind,
          scope: source.scope,
          slug: source.slug,
          sourcePath: source.sourcePath,
          publicUrl: source.publicUrl,
          checksum: source.checksum,
          lastContentUpdatedAt: source.updatedAt,
          lastIndexedAt: (/* @__PURE__ */ new Date()).toISOString(),
          currentRunId: runPartitionKey,
          isDeleted: false,
          meta: source.meta
        }
      });
      const priorChunks = previousChunksBySourceId.get(source.sourceId) ?? [];
      const canReuse = existingSource && String(existingSource.checksum) === source.checksum && priorChunks.length > 0;
      if (canReuse) {
        for (const priorChunk of priorChunks) {
          const createdChunk = await payload.create({
            collection: "rag-chunks",
            data: {
              vectorKey: `${runPartitionKey}:${source.sourceId}:${normalizeNumber(priorChunk.chunkIndex)}`,
              source: sourceDoc.id,
              run: runDocumentId,
              sourceId: source.sourceId,
              sourceTitle: source.title,
              sourceKind: source.kind,
              sourceScope: source.scope,
              sourceSlug: source.slug,
              sourcePath: source.sourcePath,
              publicUrl: source.publicUrl,
              chunkIndex: normalizeNumber(priorChunk.chunkIndex),
              heading: normalizeText(priorChunk.heading),
              anchor: normalizeText(priorChunk.anchor),
              content: normalizeText(priorChunk.content),
              tokenCount: normalizeNumber(priorChunk.tokenCount),
              contentChecksum: normalizeText(priorChunk.contentChecksum),
              embeddingModel: normalizeText(priorChunk.embeddingModel) || getEmbeddingModel(),
              embeddingDimensions: normalizeNumber(priorChunk.embeddingDimensions) || getEmbeddingDimensions(),
              embedding: priorChunk.embedding ?? [],
              isActive: false
            }
          });
          searchRows.push({
            chunkId: createdChunk.id,
            runId: runPartitionKey,
            sourceId: source.sourceId,
            sourceKind: source.kind,
            sourceScope: source.scope,
            title: source.title,
            heading: normalizeText(priorChunk.heading),
            anchor: normalizeText(priorChunk.anchor),
            publicUrl: source.publicUrl,
            sourcePath: source.sourcePath,
            content: normalizeText(priorChunk.content),
            embedding: (priorChunk.embedding ?? []).map(Number)
          });
          reusedChunks += 1;
          indexedChunks += 1;
        }
        continue;
      }
      const chunkDrafts = chunkRagSource(source);
      const embeddings = await embedTexts(chunkDrafts.map((chunk) => chunk.content));
      for (const [index, chunkDraft] of chunkDrafts.entries()) {
        const embedding = embeddings[index];
        const createdChunk = await payload.create({
          collection: "rag-chunks",
          data: {
            vectorKey: `${runPartitionKey}:${source.sourceId}:${chunkDraft.chunkIndex}`,
            source: sourceDoc.id,
            run: runDocumentId,
            sourceId: source.sourceId,
            sourceTitle: source.title,
            sourceKind: source.kind,
            sourceScope: source.scope,
            sourceSlug: source.slug,
            sourcePath: source.sourcePath,
            publicUrl: source.publicUrl,
            chunkIndex: chunkDraft.chunkIndex,
            heading: chunkDraft.heading,
            anchor: chunkDraft.anchor,
            content: chunkDraft.content,
            tokenCount: chunkDraft.tokenCount,
            contentChecksum: chunkDraft.contentChecksum,
            embeddingModel: getEmbeddingModel(),
            embeddingDimensions: getEmbeddingDimensions(),
            embedding,
            isActive: false
          }
        });
        searchRows.push({
          chunkId: createdChunk.id,
          runId: runPartitionKey,
          sourceId: source.sourceId,
          sourceKind: source.kind,
          sourceScope: source.scope,
          title: source.title,
          heading: chunkDraft.heading,
          anchor: chunkDraft.anchor,
          publicUrl: source.publicUrl,
          sourcePath: source.sourcePath,
          content: chunkDraft.content,
          embedding
        });
        indexedChunks += 1;
      }
    }
    replaceRunChunks(runPartitionKey, searchRows);
    if (activeRunDocumentId) {
      await payload.update({
        collection: "rag-ingest-runs",
        id: activeRunDocumentId,
        data: {
          isActive: false
        }
      });
      await setChunkActiveState(payload, activeRunDocumentId, false);
    }
    await setChunkActiveState(payload, runDocumentId, true);
    await payload.update({
      collection: "rag-ingest-runs",
      id: runDocumentId,
      data: {
        status: "completed",
        finishedAt: (/* @__PURE__ */ new Date()).toISOString(),
        committedAt: (/* @__PURE__ */ new Date()).toISOString(),
        isActive: true,
        indexedSourceCount: indexedSources,
        indexedChunkCount: indexedChunks,
        reusedChunkCount: reusedChunks,
        deletedSourceCount: deletedSources
      }
    });
    setActiveRunId(runPartitionKey);
    pruneInactiveRuns(runPartitionKey);
    return {
      runId: runPartitionKey,
      indexedSources,
      indexedChunks,
      reusedChunks,
      deletedSources
    };
  } catch (error) {
    clearRun(runPartitionKey);
    await payload.update({
      collection: "rag-ingest-runs",
      id: runDocumentId,
      data: {
        status: "failed",
        finishedAt: (/* @__PURE__ */ new Date()).toISOString(),
        error: serializeError(error)
      }
    });
    throw error;
  }
}
var init_ingest = __esm({
  "lib/rag/ingest.ts"() {
    "use strict";
    init_payload();
    init_chunking();
    init_embeddings();
    init_config();
    init_search_db();
    init_source_documents();
  }
});

// scripts/rag-ingest.mts
async function main() {
  const { ingestRagCorpus: ingestRagCorpus2 } = await Promise.resolve().then(() => (init_ingest(), ingest_exports));
  const summary = await ingestRagCorpus2({
    triggeredBy: "script"
  });
  console.log(JSON.stringify(summary, null, 2));
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
