export type PlanningPackItem = {
  id: string;
  title: string;
  file: string;
  filename: string;
  section: string;
  sectionLabel: string;
  slug: string;
};

export type PlanningPackManifest = {
  version: number;
  generatedAt: string;
  demo: PlanningPackItem[];
  site: PlanningPackItem[];
};
