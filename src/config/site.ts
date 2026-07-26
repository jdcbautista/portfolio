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
  role: 'DevOps / Site Reliability Engineer · AI-Assisted Ops',
  headline: 'Reliable platforms. Safe, AI-assisted automation.',
  intro:
    'Site Reliability Engineer with production operations, infrastructure ' +
    'automation, observability, incident response, and technical enablement. ' +
    'I build reliable internal platforms with Terraform, AWS, Kubernetes, ' +
    'CI/CD, and OpenTelemetry — and apply AI agents to operational workflows ' +
    'with guardrails, policy gates, retries, and auditability. U.S. Marine ' +
    'Corps veteran, based in Chicago.',
  socials: [
    { label: 'GitHub', href: 'https://github.com/jdcbautista' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/juliusdcbautista/' },
    { label: 'Website', href: 'https://juliusbautista.com/' },
  ],
  heroFaces: [
    {
      kicker: 'RELIABILITY',
      headline: 'Boring on purpose',
      sub: 'SLM · incident response · toil ↓',
      color: '#e0533d',
    },
    {
      kicker: 'PLATFORM',
      headline: 'Self-service infra',
      sub: 'Terraform · AWS · Kubernetes · CI/CD',
      color: '#4c8bf5',
    },
    {
      kicker: 'OBSERVABILITY',
      headline: 'See everything',
      sub: 'Prometheus · Grafana · OpenTelemetry',
      color: '#3fb950',
    },
    {
      kicker: 'AI-ASSISTED OPS',
      headline: 'Agents with guardrails',
      sub: 'policy gates · retries · audit logs',
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
