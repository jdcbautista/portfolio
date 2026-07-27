/**
 * CV / résumé content. This is the single source of truth for the CV page —
 * edit here to keep it in parity with the résumé document in
 * `public/Julius_Bautista_Resume.docx`.
 */
export interface CvContact {
  email: string
  phone: string
  location: string
  links: { label: string; href: string }[]
}

export interface CvSkillGroup {
  label: string
  items: string
}

export interface CvRole {
  org: string
  title: string
  location: string
  period: string
  bullets: string[]
}

export interface CvProject {
  title: string
  period: string
  bullets: string[]
}

export interface CvEntry {
  primary: string
  secondary?: string
  period: string
}

export interface CvData {
  name: string
  headline: string
  contact: CvContact
  summary: string[]
  /** Path to the downloadable résumé, relative to the site base. */
  resumeHref: string
  skills: CvSkillGroup[]
  experience: CvRole[]
  projects: CvProject[]
  additional: CvRole[]
  volunteer: CvRole[]
  certifications: CvEntry[]
  education: CvEntry[]
}

export const cv: CvData = {
  name: 'Julius Christopher Dizon Bautista',
  headline:
    'Site Reliability Engineer · Lead AI, Cloud & DevOps Instructor · U.S. Marine Corps Veteran',
  contact: {
    email: 'jdcbautista@gmail.com',
    phone: '630.346.0720',
    location: 'Chicago, IL 60602',
    links: [
      {
        label: 'linkedin.com/in/juliusdcbautista',
        href: 'https://www.linkedin.com/in/juliusdcbautista/',
      },
      { label: 'github.com/jdcbautista', href: 'https://github.com/jdcbautista' },
    ],
  },
  resumeHref: 'Julius_Bautista_Resume.docx',
  summary: [
    'Site Reliability Engineer with 15+ years delivering client-focused ' +
      'solutions across engineering, education, entrepreneurship, and design. ' +
      'Experienced in production operations, infrastructure automation, ' +
      'observability, incident response, and technical enablement.',
    'Supports reliability for 180+ production services and an automation ' +
      'platform running ~1.6M jobs per year at 99.6% success. Works across ' +
      'Terraform, AWS, Kubernetes, CI/CD, and OpenTelemetry, applying AI agents ' +
      'to operational workflows with guardrails, policy gates, retries, and ' +
      'auditability.',
    'A U.S. Marine Corps veteran, communicates complex systems clearly to both ' +
      'engineering and non-technical partners. Committed to delivering ' +
      'customer-focused solutions on scalable foundations.',
  ],
  skills: [
    { label: 'Languages', items: 'Python, Go, TypeScript/JavaScript, SQL, Bash, C#, Ruby' },
    {
      label: 'AI & Agent Systems',
      items:
        'Multi-agent orchestration, MCP, A2A, LangChain, Mem0, OpenAI, ' +
        'Anthropic, Ollama, Exo',
    },
    {
      label: 'Cloud & Infrastructure',
      items: 'AWS, Google Cloud, Kubernetes, Docker, Terraform/HCL, Ansible, Chef',
    },
    {
      label: 'Observability & Reliability',
      items:
        'Prometheus/PromQL, OpenTelemetry/OTLP, Grafana, Datadog, Splunk, ' +
        'PagerDuty, LGTM (Loki, Tempo, Mimir, Grafana) Stack',
    },
    {
      label: 'Data & Backend',
      items: 'PostgreSQL, Neo4j, Graphiti, Airflow, Astronomer, FastAPI, Django, .NET',
    },
    {
      label: 'Delivery & Testing',
      items:
        'Git/GitHub, GitHub Actions, CircleCI, pytest, unittest, Jest, RSpec, ' +
        'Playwright',
    },
  ],
  experience: [
    {
      org: 'Enova International',
      title: 'Site Reliability Engineer II',
      location: 'Chicago, IL',
      period: '2021 – Present',
      bullets: [
        'Wrote reusable Terraform modules and led the organization-wide Service ' +
          'Level Management rollout, standardizing reliability practices over ' +
          '180+ services across dozens of teams.',
        'Built an automation submission front-end tool, enabling 250+ ' +
          'non-technical representatives to self-serve engineer-developed interim ' +
          'fixes as batch jobs, reducing delivery time from several days down to ' +
          'minutes.',
        'Co-develop, operate, and maintain the Shadow platform (36 active ' +
          'automations) that runs ~21K batch submissions and ~1.6M jobs per year ' +
          'at 99.6% job-success reliability.',
        'Integrated Retool into the engineering stack as the sole SRE on a ' +
          'principal-led tiger team, building and deploying the platform’s first ' +
          'adopted application and enabling growth to 60+ internal and ' +
          'customer-servicing applications used by 1,000+ users.',
        'Train teams on cluster provisioning and bastion access, and created ' +
          'self-service terminals for controlled Kubernetes node access, adopted ' +
          'across 12+ shared services supporting our four internal brands.',
        'Serve as primary SRE captain and reliability advisor for engineering ' +
          'teams, developing SOP catalogs and interactive training modules for ' +
          '150+ engineers and 300+ non-technical users.',
      ],
    },
    {
      org: 'Code Platoon',
      title: 'Lead AI, Cloud & DevOps Instructor',
      location: 'Chicago, IL',
      period: '2023 – Present',
      bullets: [
        'Lead the AI, Cloud & DevOps evening and weekend program while ' +
          'supporting full-stack instruction across eight six-month cohorts, ' +
          'graduating over 160+ military veteran students.',
        'Design and deliver over 300+ live instructional sessions across 200+ ' +
          'lessons, labs, and assessments covering AWS, Terraform, Docker, ' +
          'Kubernetes, CI/CD, observability, and LLM tooling.',
        'Coach students through code reviews and technical assessments while ' +
          'coordinating curriculum delivery across teams of instructors and TAs.',
      ],
    },
  ],
  projects: [
    {
      title: 'AI Platforms & Agent Systems',
      period: '2025 – 2026',
      bullets: [
        'Built a stakeholder-facing AI orchestration UI so non-technical users ' +
          'can run and configure multi-agent workflows.',
        'Engineered an AI control plane with shared agent memory, ' +
          'model-provider routing, policy enforcement, and OpenTelemetry, ' +
          'Prometheus & Grafana observability using Graphiti and Neo4j.',
        'Developed a ticket-driven multi-agent product management and delivery ' +
          'platform with Django, LangChain & React.',
        'Built an AI agent for production incident support and post-incident ' +
          'reporting that integrates Slack, Datadog, Splunk, Jira, and Repomix ' +
          'for triage and post-incident reporting.',
      ],
    },
    {
      title: 'Cloud Prototyping & Startup Applications',
      period: '2023 – 2024',
      bullets: [
        'Created a spec-driven prototyping and AWS deployment platform using ' +
          'Next.js, FastAPI, Terraform, Ansible, and GitHub Actions.',
        'Designed, built, and deployed Next.js applications for two ' +
          'early-stage startups.',
      ],
    },
  ],
  additional: [
    {
      org: 'Julius Dizon Cruz Bautista Visual Arts LLC',
      title: 'Founder & Sole Proprietor',
      location: 'Chicago, IL',
      period: '2015 – 2020',
      bullets: [
        'Led commercial and community projects reaching hundreds of thousands ' +
          'of attendees across events for organizations such as the National ' +
          'Institute of Health’s All of Us Research Program, Cambria Suites, ' +
          'General Electric, and the Economic Club of Chicago.',
        'Integrated NFC and RFID into interactive multimedia art installations; ' +
          'partnered with dozens of small business owners, startups, and ' +
          'nonprofits on digitizing product lines and developing prototypes.',
      ],
    },
    {
      org: 'Fulton Street Collective',
      title: 'Creative Team Lead',
      location: 'Chicago, IL',
      period: '2012 – 2015',
      bullets: [
        'Led digital marketing and community-growth programs that doubled ' +
          'annual profits and drove expansion into a new location, raising ' +
          'artist capacity by over 50 and supporting hundreds of artists overall.',
      ],
    },
    {
      org: 'United States Marine Corps',
      title: 'Electrical Combat Engineer',
      location: 'Camp Lejeune, NC',
      period: '2004 – 2008',
      bullets: [
        'Diagnosed, repaired, and maintained electrical systems using technical ' +
          'manuals, schematics, and test equipment while maintaining operational ' +
          'readiness.',
      ],
    },
  ],
  volunteer: [
    {
      org: 'Filipino Community Center',
      title: 'Volunteer & Programming Instructor',
      location: 'Chicago, IL',
      period: '2024 – 2025',
      bullets: [
        'Organized community events and taught introductory programming to high ' +
          'school students, broadening access to technical skills.',
      ],
    },
    {
      org: 'Local Startups & Small Businesses',
      title: 'Volunteer Instruction & Team Lead',
      location: 'Chicago, IL',
      period: '2015 – 2019',
      bullets: [
        'Taught drawing and painting classes at Project Onward and Fulton ' +
          'Street Collective (2015 – 2016).',
        'Led art + marketing teams on multi-month collaborations with local ' +
          'startups (Locallective, Play Together, CNL Projects, Artists on the ' +
          'Lam), raising hundreds of thousands of dollars for underserved ' +
          'minority communities.',
      ],
    },
  ],
  certifications: [
    { primary: 'AWS Solutions Architect; Foundational C#; PCAP; JSA', period: '2023' },
    { primary: 'PCEP; JSE; WDE', period: '2021 – 2022' },
  ],
  education: [
    {
      primary: 'Code Platoon Veteran Training Program',
      secondary: 'Full Stack Development Program',
      period: '2020 – 2021',
    },
    {
      primary: 'New Horizons Computer Learning Center',
      secondary: 'Business Productivity & Design',
      period: '2012 – 2014',
    },
    {
      primary: 'University of Illinois at Chicago',
      secondary: 'Bachelor of Fine Arts',
      period: '2008 – 2012',
    },
    {
      primary: 'Marine Corps Engineer School',
      secondary: 'Electrical Engineering Program',
      period: '2005 – 2006',
    },
  ],
}
