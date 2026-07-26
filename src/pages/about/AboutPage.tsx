import { Container } from '@/shared/ui'

const STACK =
  'Python · Go · TypeScript — AI: multi-agent, MCP, LangChain, Anthropic, ' +
  'Ollama, Neo4j/Graphiti — Cloud: AWS, GCP, Kubernetes, Terraform, Docker, ' +
  'Ansible — Observability: Prometheus, Grafana, OpenTelemetry, LGTM ' +
  '(Loki/Tempo/Mimir), Datadog, Splunk, PagerDuty'

export function AboutPage() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="max-w-2xl space-y-5">
        <h1 className="text-3xl font-bold tracking-tight text-text">About</h1>

        <p className="text-muted">
          Julius Bautista — Site Reliability Engineer, and Lead AI, Cloud &amp;
          DevOps instructor. Fifteen-plus years delivering client-focused
          solutions across engineering, education, entrepreneurship, and design.
        </p>

        <p className="text-muted">
          At Enova I keep production reliable: I support 170+ services and the
          Shadow automation platform (36 automations, ~1.6M jobs a year at 99.6%
          success), led an organization-wide Service Level Management rollout
          and reusable Terraform modules, and built a self-serve tool that lets
          250+ non-technical reps ship engineer-developed fixes in minutes
          instead of days. I also build AI agents for operations — with the
          controls that make them safe to run: guardrails, policy gates,
          retries, human approval, audit logs, and OpenTelemetry telemetry.
        </p>

        <p className="text-muted">
          The first half of my career was design. I founded a visual-arts
          studio (Julius Dizon Cruz Bautista Visual Arts LLC), building
          interactive, NFC/RFID multimedia installations and creative work for
          clients including the NIH All of Us Research Program, GE, Cambria
          Suites, and the Economic Club of Chicago — reaching hundreds of
          thousands of people. That design-and-client instinct still shapes how
          I build platforms and teach. BFA from the University of Illinois at
          Chicago.
        </p>

        <p className="text-muted">
          I teach the next class of engineers, too — Lead instructor for Code
          Platoon&rsquo;s AI, Cloud &amp; DevOps program, with 160+ veteran
          graduates. And I&rsquo;m a U.S. Marine Corps veteran, where the
          reliability, readiness, and calm-under-pressure habits come from.
          Based in Chicago.
        </p>

        <p className="pt-2 text-sm text-muted">
          <span className="font-medium text-text">Stack.</span> {STACK}
        </p>
      </div>
    </Container>
  )
}
