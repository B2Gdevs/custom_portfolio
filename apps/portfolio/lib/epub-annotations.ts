export {
  PORTFOLIO_ANNOTATIONS_SCHEMA,
  PORTFOLIO_ANNOTATIONS_JSON_PATH,
  type PortfolioAnnotation,
  type PortfolioAnnotationsFile,
  parseAnnotationsFile,
  sha256Hex,
  loadAnnotationsFromIndexedDb,
  saveAnnotationsToIndexedDb,
  annotationsToExportPayload,
  serializeAnnotationsExport,
  embedAnnotationsInEpub,
} from '@portfolio/repub-builder/reader';
