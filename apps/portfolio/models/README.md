# Local ML model cache (gitignored)

This folder holds **downloaded weights** for optional **local RAG embeddings** (`RAG_EMBEDDING_PROVIDER=local`).

## Default stack

- **Model:** `Xenova/all-MiniLM-L6-v2` (sentence-transformers–compatible MiniLM, **384 dimensions**).
- **Runtime:** `@xenova/transformers` writes under **`models/.transformers-cache/`** on first use (ingest or chat retrieval).

Override the id with `RAG_LOCAL_EMBEDDING_MODEL` if you pin another Xenova-hosted feature-extraction model.

## Switching from OpenAI embeddings

1. Set **`RAG_EMBEDDING_PROVIDER=local`** (and optionally `RAG_LOCAL_EMBEDDING_MODEL`).
2. **Delete** your SQLite RAG search DB (e.g. `portfolio-rag.db` or `RAG_SQLITE_PATH`) — `sqlite-vec` stores vectors with a **fixed dimension**; OpenAI’s `text-embedding-3-small` path uses **1536**, local MiniLM uses **384**.
3. Re-run ingest (e.g. `pnpm --filter @portfolio/app rag:ingest` with your usual Payload/admin env) so chunks and vectors are rebuilt.

## Git

The directory **`models/.transformers-cache/`** is **ignored**; only this `README.md` is tracked. Do not commit weight files.

## Node install note

If local embedding fails after install, ensure transform/onnx build scripts are allowed for this workspace (`pnpm approve-builds` when pnpm warns about ignored scripts).
