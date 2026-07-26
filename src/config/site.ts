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
  role: 'Site Reliability Engineer · AI, Cloud & DevOps · Design-driven',
  headline: 'AI & Cloud Ops, with a designer’s eye.',
  intro:
    'Site Reliability Engineer with 15+ years delivering client-focused ' +
    'solutions across engineering, education, entrepreneurship, and design. I ' +
    'support 170+ production services and an automation platform running ' +
    '~1.6M jobs/year at 99.6% success — Terraform, AWS, Kubernetes, CI/CD, ' +
    'OpenTelemetry — and build AI agents for operations with guardrails, ' +
    'policy gates, and auditability. Marine Corps veteran who came up as a ' +
    'visual artist and founder. Chicago.',
  socials: [
    { label: 'GitHub', href: 'https://github.com/jdcbautista' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/juliusdcbautista/' },
    { label: 'Website', href: 'https://juliusbautista.com/' },
  ],
  heroFaces: [
    {
      kicker: 'CLOUD & SRE',
      headline: 'Reliable at scale',
      sub: '170+ services · 1.6M jobs/yr · 99.6%',
      color: '#e0533d',
    },
    {
      kicker: 'AI OPS',
      headline: 'Agents with guardrails',
      sub: 'multi-agent · control plane · audit',
      color: '#4c8bf5',
    },
    {
      kicker: 'EDUCATOR',
      headline: 'Turning veterans into shippers',
      sub: 'Lead AI/Cloud/DevOps · 160+ grads',
      color: '#3fb950',
    },
    {
      kicker: 'DESIGN',
      headline: 'Served clients by design',
      sub: 'BFA · Visual Arts LLC · NIH, GE',
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
