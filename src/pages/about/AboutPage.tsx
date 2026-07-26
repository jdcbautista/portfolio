import { Container } from '@/shared/ui'

const STACK =
  'Kubernetes · Terraform · AWS · Docker · Linux · GitHub Actions · CircleCI · ' +
  'Prometheus · Grafana · OpenTelemetry · Datadog · Splunk · PagerDuty · ' +
  'Python · Go · Ollama'

export function AboutPage() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="max-w-2xl space-y-5">
        <h1 className="text-3xl font-bold tracking-tight text-text">About</h1>

        <p className="text-muted">
          Julius Bautista — DevOps / Site Reliability Engineer. I keep
          production reliable and take the toil out of operations. At Enova
          (fintech) I work as an SRE: reusable Terraform modules, an
          organization-wide Service Level Management rollout, observability and
          incident response, large-scale application migrations, and a
          cross-team pipeline that lets non-engineers ship engineer-approved
          fixes safely.
        </p>

        <p className="text-muted">
          I also build AI agents for operational work — with the controls that
          make them safe to run: guardrails, policy gates, retries, human
          approval, audit logging, and telemetry. AI as operational tooling,
          not a demo.
        </p>

        <p className="text-muted">
          Before tech I served in the U.S. Marine Corps, where the reliability,
          readiness, and calm-under-pressure habits come from. Based in Chicago.
        </p>

        <p className="text-muted">
          What I&rsquo;m after: a platform/DevOps team where I own outcomes, not
          tickets — a modern stack at scale, direct impact, and room to bring
          safe AI tooling to operations.
        </p>

        <p className="pt-2 text-sm text-muted">
          <span className="font-medium text-text">Stack.</span> {STACK}
        </p>
      </div>
    </Container>
  )
}
