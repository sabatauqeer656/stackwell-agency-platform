// Fills the database with demo content. Run from the project root:
//   npm run seed                    add any demo content that is missing (safe to run again)
//   npm run seed -- --reset --yes   delete ALL site content first, then add the demo content
//
// Never touches users, inquiries or quote requests.
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Service from '../models/Service.js';
import Solution from '../models/Solution.js';
import Project from '../models/Project.js';
import Testimonial from '../models/Testimonial.js';
import TeamMember from '../models/TeamMember.js';
import Faq from '../models/Faq.js';
import SiteSettings from '../models/SiteSettings.js';
import { settings, services, solutions, projects, testimonials, team, faqs } from './data.js';

const args = new Set(process.argv.slice(2));
const contentModels = [Testimonial, Project, Solution, Service, TeamMember, Faq, SiteSettings];

// Creates the document only if none matches `filter`. Existing documents are left alone,
// so edits made in the admin dashboard are never overwritten by re-running the seed.
async function createIfMissing(Model, filter, data) {
  if (await Model.exists(filter)) return 'skipped';
  await Model.create(data); // full model validation runs here, so a typo in data.js fails loudly
  return 'created';
}

async function seedList(label, Model, items, filterOf, prepare = (item) => item) {
  const tally = { created: 0, skipped: 0 };
  for (const item of items) {
    const data = prepare(item);
    tally[await createIfMissing(Model, filterOf(item), data)] += 1;
  }
  console.log(`  ${label.padEnd(14)} created ${tally.created}, already there ${tally.skipped}`);
}

// Turns slugs written in data.js into the ids the database needs
async function idsBySlug(Model, slugs) {
  const docs = await Model.find({ slug: { $in: slugs } }).select('slug');
  return Object.fromEntries(docs.map((d) => [d.slug, d._id]));
}

async function run() {
  if (args.has('--reset') && !args.has('--yes')) {
    console.log('--reset deletes ALL services, solutions, projects, testimonials, team members, FAQs and settings.');
    console.log('Users, inquiries and quote requests are NOT touched.');
    console.log('Run again with  --reset --yes  to confirm.');
    return;
  }

  await connectDB();

  if (args.has('--reset')) {
    for (const Model of contentModels) await Model.deleteMany({});
    console.log('Existing site content deleted.');
  }

  console.log('Seeding demo content:');
  await seedList('settings', SiteSettings, [settings], () => ({ key: 'main' }), (s) => ({ key: 'main', ...s }));
  await seedList('services', Service, services, (s) => ({ slug: s.slug }));
  await seedList('solutions', Solution, solutions, (s) => ({ slug: s.slug }));

  const solutionId = await idsBySlug(Solution, solutions.map((s) => s.slug));
  await seedList('projects', Project, projects, (p) => ({ slug: p.slug }), (p) => {
    if (!solutionId[p.solution]) throw new Error(`Project "${p.slug}" needs the solution "${p.solution}", which does not exist.`);
    return { ...p, solution: solutionId[p.solution] };
  });

  const projectId = await idsBySlug(Project, projects.map((p) => p.slug));
  await seedList('testimonials', Testimonial, testimonials, (t) => ({ clientName: t.clientName, company: t.company }), (t) => ({
    ...t,
    project: projectId[t.project], // undefined if that project was deleted: the link is simply left out
  }));

  await seedList('team', TeamMember, team, (m) => ({ name: m.name }));
  await seedList('faqs', Faq, faqs, (f) => ({ question: f.question }));
  console.log('Done.');
}

try {
  await run();
} catch (err) {
  console.error('Seeding failed:', err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
