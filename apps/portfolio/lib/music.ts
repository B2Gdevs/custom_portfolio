export interface MusicTrack {
  slug: string;
  title: string;
  genre: string;
  duration: string;
  mood: string;
  era: string;
  description: string;
  bandlabUrl: string;
  embedUrl: string;
}

const tracks: MusicTrack[] = [
  {
    slug: 'demon-child-see-it-my-way',
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
  },
  {
    slug: 'greed-3',
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
  },
];

export function getMusicTracks(): MusicTrack[] {
  return tracks;
}
