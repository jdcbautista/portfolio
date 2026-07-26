/**
 * Personalize the portfolio here — this is the only file you need to edit for
 * your name, headline, links, the 3D hero carousel, and the video reel.
 */
export interface SocialLink {
  label: string
  href: string
}

/** One rotating face of the 3D hero carousel. */
export interface HeroFace {
  kicker: string
  headline: string
  sub: string
  /** Hex accent for this face's card. */
  color: string
}

export interface VideoConfig {
  /** Set to an mp4/webm URL to show a real player. Null = "reel coming soon". */
  src: string | null
  /** Poster image behind the play button. */
  poster: string | null
  title: string
  caption: string
}

export interface SiteConfig {
  name: string
  role: string
  headline: string
  intro: string
  socials: SocialLink[]
  heroFaces: HeroFace[]
  video: VideoConfig
}

export const site: SiteConfig = {
  name: 'Julius Bautista',
  role: 'SRE · Applied AI · Educator · Artist',
  headline: 'I build infra that stays boring in production.',
  intro:
    'Filipino-American USMC veteran, Site Reliability Engineer, and DevOps ' +
    'instructor. I ship AI that survives real constraints and software that ' +
    'removes friction. Spin the carousel — then pick something to try.',
  socials: [
    { label: 'GitHub', href: 'https://github.com/jdcbautista' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/juliusdcbautista/' },
    { label: 'Website', href: 'https://juliusbautista.com/' },
  ],
  heroFaces: [
    {
      kicker: 'SRE / DEVOPS',
      headline: 'Boring in prod',
      sub: 'Terraform · AWS · Actions',
      color: '#e0533d',
    },
    {
      kicker: 'APPLIED AI',
      headline: 'Agents that survive',
      sub: 'Ollama · Graphiti · Neo4j',
      color: '#4c8bf5',
    },
    {
      kicker: 'EDUCATOR',
      headline: 'Students into shippers',
      sub: 'Code Platoon · curriculum',
      color: '#3fb950',
    },
    {
      kicker: 'VISUAL ARTIST',
      headline: 'Codes like he composes',
      sub: 'Blender · generative · story',
      color: '#a371f7',
    },
  ],
  video: {
    src: null,
    poster: null,
    title: 'Reel',
    caption: 'A short walkthrough is landing here soon — drop an mp4 in config.',
  },
}
