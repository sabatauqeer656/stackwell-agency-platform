// Demo content for the Stackwell website. Everything here is FICTIONAL:
// the company, clients, people and numbers are made up for this portfolio project.

export const settings = {
  companyName: 'Stackwell',
  tagline: 'We build software that moves your business forward.',
  email: 'hello@stackwell.example',
  phone: '+1 (555) 010-0199',
  address: 'Remote-first team, working with clients worldwide',
  footerText: 'Stackwell is a fictional agency created for a portfolio project.',
};

export const services = [
  {
    slug: 'custom-web-applications',
    title: 'Custom Web Applications',
    summary: 'Dashboards, client portals and SaaS products built to fit the way your business actually works.',
    description:
      'We design and build web applications that replace spreadsheets, manual processes and off-the-shelf tools that no longer fit. From a first prototype to a production system with thousands of users, we focus on speed, clear interfaces and code your team can maintain.',
    icon: 'Code',
    features: ['Single-page apps with React', 'Role-based access and secure login', 'Real-time dashboards and reporting', 'Third-party integrations', 'Automated testing and deployment'],
    order: 1,
  },
  {
    slug: 'mobile-app-development',
    title: 'Mobile App Development',
    summary: 'Fast, polished iOS and Android apps that people enjoy using and keep coming back to.',
    description:
      'We build cross-platform mobile apps from one codebase, so you reach iPhone and Android users sooner and spend less. Our process covers product discovery, design, development, store submission and the updates that follow.',
    icon: 'Smartphone',
    features: ['iOS and Android from one codebase', 'Offline-first experiences', 'Push notifications', 'App store submission and updates', 'Analytics and crash reporting'],
    order: 2,
  },
  {
    slug: 'ecommerce-solutions',
    title: 'E-commerce Solutions',
    summary: 'Online stores with smooth checkout, secure payments and inventory tools your team will love.',
    description:
      'Whether you are launching your first shop or outgrowing your current platform, we build stores that load quickly, convert well and are easy to manage. We connect payments, shipping, inventory and the tools your team already uses.',
    icon: 'ShoppingCart',
    features: ['Custom storefronts and checkout', 'Payment gateway integration', 'Inventory and order management', 'Product search and filtering', 'Performance and SEO tuning'],
    order: 3,
  },
  {
    slug: 'ui-ux-design',
    title: 'UI/UX Design',
    summary: 'Research-led design that makes complex products feel simple, clear and trustworthy.',
    description:
      'Good software starts with understanding the people who use it. We run user research, map journeys, prototype quickly and test with real users before a single line of production code is written. You get a design system your team can keep extending.',
    icon: 'Palette',
    features: ['User research and interviews', 'Wireframes and clickable prototypes', 'Design systems and component libraries', 'Accessibility reviews (WCAG)', 'Usability testing'],
    order: 4,
  },
  {
    slug: 'api-backend-development',
    title: 'API & Backend Development',
    summary: 'Secure, well-documented APIs and cloud backends that scale with your product.',
    description:
      'We build the engine behind your product: databases, APIs, authentication, background jobs and integrations. Our backends are validated, tested and documented, so your web and mobile teams can build on them with confidence.',
    icon: 'Server',
    features: ['REST and GraphQL APIs', 'Database design and migrations', 'Authentication and authorization', 'Cloud deployment and monitoring', 'Third-party and legacy integrations'],
    order: 5,
  },
  {
    slug: 'maintenance-support',
    title: 'Maintenance & Support',
    summary: 'Ongoing updates, monitoring and fast fixes so your software stays secure and reliable.',
    description:
      'Launching is only the beginning. Our support plans cover security updates, dependency upgrades, performance monitoring and a fast response when something breaks. You get a team that already knows your system.',
    icon: 'LifeBuoy',
    features: ['Security patches and upgrades', 'Uptime and performance monitoring', 'Bug fixes with agreed response times', 'Monthly improvement hours', 'Regular health reports'],
    order: 6,
  },
];

export const solutions = [
  {
    slug: 'fintech',
    title: 'Fintech',
    summary: 'Secure, compliant software for payments, lending and financial operations.',
    description:
      'Financial products demand security, accuracy and trust. We build payment flows, dashboards, onboarding and reporting tools with audit trails, strong authentication and careful handling of sensitive data.',
    icon: 'Landmark',
    challenges: ['Strict security and compliance needs', 'Reliable, accurate money movement', 'Fast and trusted customer onboarding', 'Real-time reporting and reconciliation'],
    order: 1,
  },
  {
    slug: 'healthcare',
    title: 'Healthcare',
    summary: 'Patient-friendly tools that cut admin work and help clinics focus on care.',
    description:
      'Clinics and care providers lose hours to scheduling, paperwork and disconnected systems. We build booking, patient portals and internal tools that are simple for staff, accessible for patients and careful with private data.',
    icon: 'HeartPulse',
    challenges: ['Privacy and data protection', 'Complex scheduling across teams', 'Accessible tools for every patient', 'Disconnected legacy systems'],
    order: 2,
  },
  {
    slug: 'retail-ecommerce',
    title: 'Retail & E-commerce',
    summary: 'Storefronts and operations software that turn browsers into loyal customers.',
    description:
      'Online retail is won on speed, trust and convenience. We build storefronts, inventory tools and loyalty features that keep customers coming back and keep your operations team out of spreadsheets.',
    icon: 'Store',
    challenges: ['Slow pages and abandoned carts', 'Inventory across several channels', 'Rising customer acquisition costs', 'Seasonal traffic spikes'],
    order: 3,
  },
  {
    slug: 'education',
    title: 'Education',
    summary: 'Learning platforms that keep students engaged and teachers in control.',
    description:
      'Schools and training companies need software that works for students of every age and teachers with little spare time. We build course platforms, progress tracking and communication tools that are easy to adopt.',
    icon: 'GraduationCap',
    challenges: ['Keeping learners engaged', 'Tracking progress at scale', 'Tools that teachers can adopt quickly', 'Access on any device'],
    order: 4,
  },
];

// `solution` is the slug of one of the solutions above; the seed turns it into an id.
export const projects = [
  {
    slug: 'ledgerly-payments-dashboard',
    title: 'Ledgerly Payments Dashboard',
    clientName: 'Ledgerly',
    solution: 'fintech',
    summary: 'A real-time dashboard that gave a payments startup instant visibility into transactions and failures.',
    challenge:
      'Ledgerly’s finance team reconciled payments in spreadsheets every night. Failed transactions were found a day late, and support had no single place to look up a customer’s payment history.',
    approach:
      'We built a React dashboard on a Node.js API that streams transaction events, flags failures instantly and lets support search any customer in seconds. Role-based access and a full audit trail kept the system compliant.',
    results: ['Nightly reconciliation cut from 4 hours to 15 minutes', 'Failed payments detected within seconds', 'Support lookup time reduced by 70%'],
    techStack: ['React', 'Node.js', 'MongoDB', 'WebSockets', 'Tailwind CSS'],
    completedAt: '2025-06-30',
    isFeatured: true,
    order: 1,
  },
  {
    slug: 'kestrel-pay-onboarding',
    title: 'Kestrel Pay Onboarding Flow',
    clientName: 'Kestrel Pay',
    solution: 'fintech',
    summary: 'A guided onboarding experience that doubled the share of businesses completing verification.',
    challenge:
      'Most new merchants abandoned Kestrel Pay’s onboarding halfway through. The form was long, error messages were unclear and there was no way to save progress and return later.',
    approach:
      'We redesigned the flow as short, focused steps with inline validation, autosave and clear status updates. The backend verifies documents asynchronously and notifies merchants as soon as they are approved.',
    results: ['Completion rate doubled from 31% to 64%', 'Average onboarding time cut from 3 days to 1', 'Support tickets about onboarding fell by half'],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    completedAt: '2025-02-14',
    isFeatured: false,
    order: 2,
  },
  {
    slug: 'careloop-patient-portal',
    title: 'CareLoop Patient Portal',
    clientName: 'CareLoop Health',
    solution: 'healthcare',
    summary: 'An accessible portal for booking, reminders and secure messaging across a network of clinics.',
    challenge:
      'CareLoop’s clinics took bookings by phone, which tied up reception and caused many missed appointments. Patients had no simple way to reschedule or ask a quick question.',
    approach:
      'We built a mobile-friendly portal where patients book, reschedule and message their clinic securely, with automatic reminders. Staff manage everything from a clear calendar view designed with receptionists.',
    results: ['No-show rate down by 35%', 'Phone bookings reduced by 60%', 'Portal rated 4.8 out of 5 by patients'],
    techStack: ['React', 'Node.js', 'MongoDB', 'Twilio', 'WCAG 2.1 AA'],
    completedAt: '2025-04-18',
    isFeatured: true,
    order: 3,
  },
  {
    slug: 'tidewater-clinic-scheduling',
    title: 'Tidewater Clinic Scheduling',
    clientName: 'Tidewater Clinics',
    solution: 'healthcare',
    summary: 'Smart scheduling that balanced staff workload and cut patient waiting times.',
    challenge:
      'Scheduling at Tidewater was done by hand across five locations. Double bookings were common, and some practitioners were overloaded while others had empty slots.',
    approach:
      'We built a scheduling engine that respects availability, room limits and treatment length, with a drag-and-drop calendar for staff. Conflicts are caught before they are saved.',
    results: ['Double bookings eliminated', 'Average waiting time reduced by 25%', 'Practitioner utilization up by 18%'],
    techStack: ['React', 'Node.js', 'MongoDB', 'Day.js'],
    completedAt: '2024-11-22',
    isFeatured: false,
    order: 4,
  },
  {
    slug: 'urbancart-storefront',
    title: 'UrbanCart Storefront Rebuild',
    clientName: 'UrbanCart',
    solution: 'retail-ecommerce',
    summary: 'A faster, simpler storefront that lifted conversion and survived the holiday traffic spike.',
    challenge:
      'UrbanCart’s old store took over six seconds to load on mobile and crashed during sales. Checkout had too many steps, and shoppers abandoned carts at a high rate.',
    approach:
      'We rebuilt the storefront with server-side rendering, image optimization and a one-page checkout. The catalog is cached at the edge, and load testing proved it could handle ten times the usual traffic.',
    results: ['Mobile load time cut from 6.2s to 1.8s', 'Conversion rate up by 28%', 'Zero downtime during the holiday peak'],
    techStack: ['React', 'Node.js', 'MongoDB', 'Stripe', 'Redis'],
    completedAt: '2025-01-10',
    isFeatured: true,
    order: 5,
  },
  {
    slug: 'brightpath-learning-platform',
    title: 'BrightPath Learning Platform',
    clientName: 'BrightPath Learning',
    solution: 'education',
    summary: 'A course platform with progress tracking that kept learners engaged from lesson one to certificate.',
    challenge:
      'BrightPath delivered courses by email and shared documents. Learners lost track of their progress, and instructors had no idea who was struggling until it was too late.',
    approach:
      'We built a learning platform with video lessons, quizzes, streaks and a progress dashboard for learners, plus an instructor view that highlights students who are falling behind.',
    results: ['Course completion up from 38% to 71%', 'Instructor reporting time cut by 80%', 'Platform now serves over 12,000 learners'],
    techStack: ['React', 'Node.js', 'MongoDB', 'Video streaming', 'Tailwind CSS'],
    completedAt: '2024-09-05',
    isFeatured: false,
    order: 6,
  },
];

// `project` (optional) is the slug of a project above.
export const testimonials = [
  {
    clientName: 'Maya Okafor',
    clientRole: 'Head of Operations',
    company: 'Ledgerly',
    quote: 'Stackwell turned a nightly spreadsheet nightmare into a dashboard we trust. They listened, shipped early and never left us guessing.',
    rating: 5,
    project: 'ledgerly-payments-dashboard',
    order: 1,
  },
  {
    clientName: 'Daniel Reyes',
    clientRole: 'Chief Medical Officer',
    company: 'CareLoop Health',
    quote: 'Our patients love the portal and our reception team finally has time to focus on people. The accessibility work was exceptional.',
    rating: 5,
    project: 'careloop-patient-portal',
    order: 2,
  },
  {
    clientName: 'Priya Nair',
    clientRole: 'Founder',
    company: 'UrbanCart',
    quote: 'Holiday traffic used to terrify us. This year the store did not blink, and sales were our best ever.',
    rating: 5,
    project: 'urbancart-storefront',
    order: 3,
  },
  {
    clientName: 'Tom Whitfield',
    clientRole: 'Director of Learning',
    company: 'BrightPath Learning',
    quote: 'Clear communication, honest estimates and a platform our learners actually finish courses on. We have already booked phase two.',
    rating: 5,
    project: 'brightpath-learning-platform',
    order: 4,
  },
];

export const team = [
  {
    name: 'Amara Hughes',
    role: 'Founder & Engineering Lead',
    bio: 'Amara has spent over a decade building web platforms for startups and scale-ups. She leads architecture and keeps every project honest about trade-offs.',
    order: 1,
  },
  {
    name: 'Luca Moretti',
    role: 'Senior Full-Stack Engineer',
    bio: 'Luca loves turning messy requirements into clean, tested code. He specializes in React, Node.js and the APIs that connect them.',
    order: 2,
  },
  {
    name: 'Sana Iqbal',
    role: 'Product Designer',
    bio: 'Sana designs interfaces that feel obvious. She leads research and usability testing, and cares deeply about accessibility.',
    order: 3,
  },
  {
    name: 'Jonas Becker',
    role: 'DevOps & Support Engineer',
    bio: 'Jonas keeps releases smooth and systems healthy. He looks after deployments, monitoring and our support plans.',
    order: 4,
  },
];

export const faqs = [
  { category: 'General', question: 'What kind of projects do you take on?', answer: 'We build web applications, mobile apps, e-commerce stores and the APIs behind them. If it involves custom software for a business, we are happy to talk about it.', order: 1 },
  { category: 'General', question: 'Do you work with startups or only established companies?', answer: 'Both. Many of our clients are early-stage teams that need a first version fast, and others are established businesses modernizing existing systems.', order: 2 },
  { category: 'Pricing', question: 'How much does a project cost?', answer: 'It depends on scope. Small projects start around $5,000, and larger platforms run from $15,000 to $100,000 or more. After a short discovery call we send a fixed or phased quote, so there are no surprises.', order: 1 },
  { category: 'Pricing', question: 'Do you offer fixed-price or hourly work?', answer: 'Both. Well-defined projects work best at a fixed price. For evolving products we suggest a monthly retainer with an agreed number of hours.', order: 2 },
  { category: 'Process', question: 'How does a project work from start to finish?', answer: 'We start with discovery and design, then build in short iterations with a demo every two weeks. You see real progress early and can change direction before it gets expensive.', order: 1 },
  { category: 'Process', question: 'How long does a typical project take?', answer: 'A focused first version usually takes 6 to 12 weeks. Larger platforms are delivered in phases, so you can launch and learn while we keep building.', order: 2 },
  { category: 'Support', question: 'Do you offer support after launch?', answer: 'Yes. Our maintenance plans cover security updates, monitoring, bug fixes and monthly improvement hours, so your software stays healthy after it goes live.', order: 1 },
  { category: 'Support', question: 'Who owns the code?', answer: 'You do. Once the project is paid for, the code and all related assets belong to you, and we hand over documentation so any developer can continue the work.', order: 2 },
];
