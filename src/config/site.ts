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
  role: 'Site Reliability Engineer · Designer by training',
  headline: 'Fifteen years making things people rely on.',
  intro:
    'I build reliable systems and the tools that keep them calm — cloud, ' +
    'reliability, and AI operations. Before engineering, I spent years serving ' +
    'clients as a designer and founder. Marine Corps veteran, Chicago.',
  socials: [
    { label: 'GitHub', href: 'https://github.com/jdcbautista' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/juliusdcbautista/' },
    { label: 'Website', href: 'https://juliusbautista.com/' },
  ],
  heroFaces: [
    {
      kicker: 'RELIABILITY',
      headline: 'Boring, on purpose',
      sub: 'quiet, dependable systems',
      color: '#e0533d',
    },
    {
      kicker: 'AI OPS',
      headline: 'Agents that stay in bounds',
      sub: 'guardrails over cleverness',
      color: '#4c8bf5',
    },
    {
      kicker: 'TEACHING',
      headline: 'Veterans into engineers',
      sub: 'Code Platoon',
      color: '#3fb950',
    },
    {
      kicker: 'DESIGN',
      headline: 'The first ten years',
      sub: 'craft in the details',
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
