/** Realistic demo data for ResumeIntel */

export const DEMO_PASSWORD = 'Password123!';

export const users = [
  {
    name: 'Alex Morgan',
    email: 'admin@resumeintel.demo',
    role: 'admin',
    title: 'Platform Administrator',
    company: 'ResumeIntel',
  },
  {
    name: 'Sarah Chen',
    email: 'sarah.chen@techcorp.demo',
    role: 'recruiter',
    title: 'Senior Talent Partner',
    company: 'TechCorp Solutions',
  },
  {
    name: 'James Okonkwo',
    email: 'james.okonkwo@hireflow.demo',
    role: 'recruiter',
    title: 'Head of Engineering Hiring',
    company: 'HireFlow Inc',
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@email.demo',
    role: 'candidate',
    title: 'Full Stack Developer',
  },
  {
    name: 'Michael Torres',
    email: 'michael.torres@email.demo',
    role: 'candidate',
    title: 'Software Engineer',
  },
  {
    name: 'Emily Nakamura',
    email: 'emily.nakamura@email.demo',
    role: 'candidate',
    title: 'Frontend Developer',
  },
  {
    name: 'David Kim',
    email: 'david.kim@email.demo',
    role: 'candidate',
    title: 'Backend Engineer',
  },
  {
    name: 'Rachel Brooks',
    email: 'rachel.brooks@email.demo',
    role: 'candidate',
    title: 'DevOps Engineer',
  },
];

export const resumeTemplates = [
  {
    title: 'Priya Sharma - Software Resume',
    fileName: 'Priya_Sharma_Resume.pdf',
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS', 'Docker', 'REST APIs', 'Git'],
    summary:
      'Full stack developer with 4+ years building scalable web applications. Strong focus on React ecosystems and cloud-native deployments.',
    experience: [
      {
        company: 'FinEdge Labs',
        title: 'Software Engineer II',
        startDate: '2021-03',
        endDate: 'Present',
        description:
          'Led migration of monolith to microservices serving 200K daily users. Reduced API latency by 35% through caching and query optimization.',
      },
      {
        company: 'BrightApps',
        title: 'Junior Developer',
        startDate: '2019-06',
        endDate: '2021-02',
        description: 'Built customer dashboard in React and integrated Stripe billing.',
      },
    ],
    education: [
      {
        institution: 'Georgia Institute of Technology',
        degree: 'B.S.',
        field: 'Computer Science',
        startYear: 2015,
        endYear: 2019,
      },
    ],
    projects: [
      {
        name: 'Interview Prep Tracker',
        description: 'SaaS app for tracking mock interviews and skill gaps.',
        technologies: ['React', 'Node.js', 'PostgreSQL'],
      },
    ],
    certifications: [{ name: 'AWS Certified Developer – Associate', issuer: 'Amazon', year: 2023 }],
    atsScore: 84,
    missingKeywords: ['Kubernetes', 'GraphQL', 'CI/CD'],
    formattingSuggestions: [
      'Add a dedicated Technical Skills section near the top',
      'Use bullet points with quantified outcomes',
    ],
    improvementTips: [
      'Include Kubernetes if you have exposure in side projects',
      'Mirror job posting keywords in your summary',
    ],
  },
  {
    title: 'Michael Torres - Backend Resume',
    fileName: 'Michael_Torres_CV.pdf',
    skills: ['Python', 'Django', 'PostgreSQL', 'Redis', 'AWS', 'Lambda', 'API Design', 'Agile'],
    summary: 'Backend engineer specializing in high-throughput APIs and data pipelines.',
    experience: [
      {
        company: 'DataStream Co',
        title: 'Backend Engineer',
        startDate: '2020-01',
        endDate: 'Present',
        description: 'Designed event-driven architecture processing 2M events/day with 99.9% uptime.',
      },
    ],
    education: [
      {
        institution: 'University of Texas at Austin',
        degree: 'B.S.',
        field: 'Computer Science',
        startYear: 2016,
        endYear: 2020,
      },
    ],
    projects: [],
    certifications: [],
    atsScore: 78,
    missingKeywords: ['microservices', 'Terraform'],
    formattingSuggestions: ['Avoid tables; use plain text sections for ATS parsers'],
    improvementTips: ['Add Terraform if used in infrastructure work'],
  },
  {
    title: 'Emily Nakamura - Frontend Resume',
    fileName: 'Emily_Nakamura_Resume.pdf',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Figma', 'Accessibility', 'Jest', 'Cypress'],
    summary: 'Frontend developer passionate about accessible, performant UI and design systems.',
    experience: [
      {
        company: 'Pixel & Code',
        title: 'Frontend Developer',
        startDate: '2021-08',
        endDate: 'Present',
        description: 'Built component library used across 12 product teams. Improved Lighthouse scores from 72 to 94.',
      },
    ],
    education: [
      {
        institution: 'UC San Diego',
        degree: 'B.A.',
        field: 'Design & Media',
        startYear: 2017,
        endYear: 2021,
      },
    ],
    projects: [
      {
        name: 'A11y Design Kit',
        description: 'Open-source accessibility checklist for React teams.',
        technologies: ['React', 'Storybook'],
      },
    ],
    certifications: [],
    atsScore: 91,
    missingKeywords: ['Redux', 'Webpack'],
    formattingSuggestions: ['Strong portfolio link in header'],
    improvementTips: ['Mention Redux if used in production apps'],
  },
  {
    title: 'David Kim - Cloud Resume',
    fileName: 'David_Kim_Resume.pdf',
    skills: ['Java', 'Spring Boot', 'Kubernetes', 'Docker', 'AWS', 'GCP', 'Terraform', 'CI/CD', 'Linux'],
    summary: 'Backend and platform engineer with expertise in container orchestration and IaC.',
    experience: [
      {
        company: 'CloudNine Systems',
        title: 'Platform Engineer',
        startDate: '2018-05',
        endDate: 'Present',
        description: 'Managed EKS clusters for 40+ services. Cut deployment time from 45min to 8min via GitOps.',
      },
    ],
    education: [
      {
        institution: 'University of Washington',
        degree: 'M.S.',
        field: 'Computer Science',
        startYear: 2016,
        endYear: 2018,
      },
    ],
    projects: [],
    certifications: [
      { name: 'CKA: Certified Kubernetes Administrator', issuer: 'CNCF', year: 2022 },
    ],
    atsScore: 88,
    missingKeywords: ['observability', 'Prometheus'],
    formattingSuggestions: ['List certifications with expiration dates'],
    improvementTips: ['Add observability stack experience (Prometheus/Grafana)'],
  },
  {
    title: 'Rachel Brooks - DevOps Resume',
    fileName: 'Rachel_Brooks_Resume.pdf',
    skills: ['Azure', 'AWS', 'Jenkins', 'GitHub Actions', 'Ansible', 'Python', 'Bash', 'Monitoring'],
    summary: 'DevOps engineer focused on reliable CI/CD and infrastructure automation.',
    experience: [
      {
        company: 'RetailMax',
        title: 'DevOps Engineer',
        startDate: '2019-11',
        endDate: 'Present',
        description: 'Implemented blue-green deployments reducing rollback incidents by 60%.',
      },
    ],
    education: [
      {
        institution: 'Purdue University',
        degree: 'B.S.',
        field: 'Information Technology',
        startYear: 2014,
        endYear: 2018,
      },
    ],
    projects: [],
    certifications: [{ name: 'Azure Administrator Associate', issuer: 'Microsoft', year: 2023 }],
    atsScore: 82,
    missingKeywords: ['Docker', 'security compliance'],
    formattingSuggestions: ['Include security/compliance frameworks if applicable'],
    improvementTips: ['Highlight Docker containerization experience'],
  },
];

export const jobs = [
  {
    recruiterEmail: 'sarah.chen@techcorp.demo',
    title: 'Senior Full Stack Engineer',
    company: 'TechCorp Solutions',
    location: 'San Francisco, CA (Hybrid)',
    employmentType: 'full-time',
    description: `TechCorp is hiring a Senior Full Stack Engineer to build customer-facing products used by Fortune 500 clients.

Responsibilities:
- Design and implement RESTful APIs and React frontends
- Collaborate with product and design on feature delivery
- Mentor junior engineers and participate in code reviews
- Improve CI/CD pipelines and deployment reliability

Requirements:
- 4+ years professional software development
- Strong JavaScript/TypeScript, React, Node.js
- Experience with MongoDB or PostgreSQL
- AWS or cloud deployment experience
- Excellent communication skills`,
    requirements: [
      '4+ years experience',
      'React and Node.js',
      'Cloud platforms (AWS preferred)',
      'Agile team experience',
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS', 'Docker', 'CI/CD'],
    salary: { min: 140000, max: 185000, currency: 'USD' },
  },
  {
    recruiterEmail: 'sarah.chen@techcorp.demo',
    title: 'Frontend Developer',
    company: 'TechCorp Solutions',
    location: 'Remote - US',
    employmentType: 'remote',
    description: `Join our product squad building accessible, high-performance UIs.

You will work with React, TypeScript, and our internal design system. Experience with Next.js and testing (Jest/Cypress) is a plus.`,
    requirements: ['2+ years React', 'TypeScript', 'CSS/Tailwind', 'Accessibility awareness'],
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Jest', 'Figma'],
    salary: { min: 110000, max: 145000, currency: 'USD' },
  },
  {
    recruiterEmail: 'james.okonkwo@hireflow.demo',
    title: 'Backend Engineer - Platform',
    company: 'HireFlow Inc',
    location: 'Austin, TX',
    employmentType: 'full-time',
    description: `HireFlow's platform team owns core APIs and data services.

We're looking for someone skilled in Python or Java, distributed systems, and PostgreSQL. Kubernetes and Terraform experience highly valued.`,
    requirements: ['Backend API design', 'SQL databases', 'Cloud infrastructure', 'On-call rotation'],
    skills: ['Python', 'PostgreSQL', 'Redis', 'Kubernetes', 'Terraform', 'AWS', 'microservices'],
    salary: { min: 130000, max: 170000, currency: 'USD' },
  },
  {
    recruiterEmail: 'james.okonkwo@hireflow.demo',
    title: 'DevOps Engineer',
    company: 'HireFlow Inc',
    location: 'Chicago, IL (Hybrid)',
    employmentType: 'full-time',
    description: `Maintain CI/CD, monitoring, and infrastructure as code across Azure and AWS environments.

Ideal candidate has GitHub Actions, Ansible, and incident response experience.`,
    requirements: ['CI/CD pipelines', 'IaC', 'Linux', 'Scripting (Python/Bash)'],
    skills: ['Azure', 'AWS', 'GitHub Actions', 'Jenkins', 'Ansible', 'Python', 'Docker'],
    salary: { min: 115000, max: 150000, currency: 'USD' },
  },
];

export const jdMatchSamples = [
  {
    candidateEmail: 'priya.sharma@email.demo',
    jobTitle: 'Senior Full Stack Engineer at TechCorp',
    jobDescription: `Senior Full Stack Engineer with React, Node.js, TypeScript, MongoDB, AWS. Microservices and CI/CD experience preferred.`,
    matchPercentage: 79,
    missingSkills: ['Kubernetes', 'GraphQL'],
    matchedSkills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS', 'Docker'],
    keywordGaps: ['Add GraphQL if used in APIs', 'Highlight CI/CD in experience bullets'],
    recommendations: [
      'Tailor summary to mention full stack ownership',
      'Add metrics from FinEdge migration project',
    ],
  },
  {
    candidateEmail: 'emily.nakamura@email.demo',
    jobTitle: 'Frontend Developer at TechCorp',
    jobDescription: `Frontend Developer role requiring React, TypeScript, Tailwind CSS, Next.js, and strong accessibility practices. Design system and Jest/Cypress testing experience preferred.`,
    matchPercentage: 92,
    missingSkills: ['Redux'],
    matchedSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Jest', 'Figma'],
    keywordGaps: ['Mention Redux Toolkit if applicable'],
    recommendations: ['Link to portfolio and A11y Design Kit project', 'Emphasize Lighthouse performance wins'],
  },
];

export const interviewQuestionSamples = [
  {
    candidateEmail: 'priya.sharma@email.demo',
    targetRole: 'Senior Full Stack Engineer',
    questions: [
      {
        text: 'Walk me through a recent project where you improved system performance. What metrics did you move?',
        category: 'behavioral',
        difficulty: 'medium',
        suggestedAnswer: 'Use STAR: Situation at FinEdge, Task to reduce latency, Actions (caching, DB indexes), Result (35% improvement).',
        tips: ['Quantify impact', 'Mention trade-offs'],
      },
      {
        text: 'How would you design a REST API for a job application tracking system?',
        category: 'technical',
        difficulty: 'hard',
        suggestedAnswer: 'Discuss resources, auth, pagination, idempotency, and error handling.',
        tips: ['Draw entities on whiteboard', 'Mention OpenAPI'],
      },
      {
        text: 'Explain the difference between SQL and NoSQL. When would you pick MongoDB?',
        category: 'technical',
        difficulty: 'medium',
        tips: ['Give concrete use cases from your experience'],
      },
      {
        text: 'Why are you interested in TechCorp and this role?',
        category: 'hr',
        difficulty: 'easy',
        tips: ['Research company values', 'Connect to your stack'],
      },
    ],
  },
  {
    candidateEmail: 'david.kim@email.demo',
    targetRole: 'Backend Engineer - Platform',
    questions: [
      {
        text: 'Describe your experience operating Kubernetes in production.',
        category: 'technical',
        difficulty: 'hard',
        tips: ['Mention CKA certification', 'Talk about incidents and runbooks'],
      },
      {
        text: 'How do you approach infrastructure as code reviews?',
        category: 'project-based',
        difficulty: 'medium',
        tips: ['Terraform modules', 'State management'],
      },
    ],
  },
];
