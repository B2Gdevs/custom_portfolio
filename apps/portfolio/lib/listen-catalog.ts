export type ListenCatalogKind = 'track' | 'preset';
export type ListenCatalogVisibility = 'public' | 'private';

export interface ListenCatalogEntry {
  slug: string;
  catalogKind: ListenCatalogKind;
  visibility: ListenCatalogVisibility;
  title: string;
  genre: string;
  mood: string;
  era: string;
  duration?: string;
  description: string;
  bandlabUrl: string;
  embedUrl: string;
  artworkUrl?: string;
  lockGroup?: string;
  /** Optional ISO date for sort when using newest/oldest */
  date?: string;
  extraTags?: string[];
}

const catalog: ListenCatalogEntry[] = [
  {
    slug: 'demon-child-see-it-my-way',
    catalogKind: 'track',
    visibility: 'public',
    title: 'Demon Child - (See it My Way)',
    genre: 'Rock',
    duration: '2:50',
    mood: 'Defiant, theatrical, fevered',
    era: 'Companion track',
    description:
      'A sharp-edged introduction to the emotional pressure around the book: confrontation, appetite, and the feeling of a voice refusing to be handled gently.',
    bandlabUrl:
      'https://www.bandlab.com/track/4ae1c92d-8d48-407b-b460-8181a6266388?revId=f336ded5-ebae-487c-8e3e-e2f6319a2aa0',
    embedUrl: 'https://www.bandlab.com/embed/?id=f336ded5-ebae-487c-8e3e-e2f6319a2aa0',
    date: '2026-02-01',
  },
  {
    slug: 'greed-3',
    catalogKind: 'track',
    visibility: 'public',
    title: 'Greed 3.0',
    genre: 'Hip Hop',
    duration: '2:10',
    mood: 'Tense, hungry, direct',
    era: 'Field note',
    description:
      'A more urban and hard-edged sketch. This lane can hold songs that feel like the underside of the world: ambition, corrosion, and motion under pressure.',
    bandlabUrl:
      'https://www.bandlab.com/track/1637d69f-33d5-f011-819b-6045bd3096b1?revId=1437d69f-33d5-f011-819b-6045bd3096b1',
    embedUrl: 'https://www.bandlab.com/embed/?id=1437d69f-33d5-f011-819b-6045bd3096b1',
    date: '2026-01-15',
  },
  {
    slug: 'dont-let-me-be-forgotten',
    catalogKind: 'track',
    visibility: 'public',
    title: 'Love in the Grave',
    genre: 'Alternative',
    duration: '3:04',
    mood: 'Melancholic, aching, exposed',
    era: 'Public release',
    description:
      'A slow-burn alternative piece: grief, memory, and the weight of wanting to be held when the world moves on without you.',
    bandlabUrl:
      'https://www.bandlab.com/track/8e892de4-51b7-f011-8196-0022484a3197?revId=8b892de4-51b7-f011-8196-0022484a3197',
    embedUrl: 'https://www.bandlab.com/embed/?id=8b892de4-51b7-f011-8196-0022484a3197',
    date: '2026-03-24',
    extraTags: ['BandLab', 'Public track'],
  },
  {
    slug: 'private-shared-track',
    catalogKind: 'track',
    visibility: 'private',
    title: 'Private archive track',
    genre: 'Private track',
    duration: 'Owner only',
    mood: 'Hidden, internal, revision-stage',
    era: 'Owner archive',
    description:
      'A private BandLab revision reserved for the authenticated owner session. It should not surface in the public listening room at all.',
    bandlabUrl:
      'https://www.bandlab.com/revisions/2e2205ff-99cf-f011-8196-000d3a96100f?sharedKey=ibrwfiUVZ0ebQXyKAi0uOA',
    embedUrl: '',
    date: '2026-03-25',
    extraTags: ['BandLab', 'Private track'],
  },
  {
    slug: 'bandlab-effect-preset-8f8d1ca2196640c1aeaac13e51383e11',
    catalogKind: 'preset',
    visibility: 'public',
    title: 'Polished shelf chain',
    genre: 'Preset',
    mood: 'Polished, produced',
    era: 'BandLab preset',
    description:
      'A BandLab effect-preset chain for lift, air, and glue on vocals or melodic parts when you want presence without harshness.',
    bandlabUrl:
      'https://www.bandlab.com/effect-presets/8f8d1ca2196640c1aeaac13e51383e11-b62e01a253b848829eebaffa3aa676fc-6f5153d425ed421588dc168449324f74-user',
    embedUrl: '',
    date: '2026-03-20',
    extraTags: ['BandLab', 'Effect preset'],
  },
];

export function getListenCatalog(): ListenCatalogEntry[] {
  return catalog;
}
