// TEMPORARY: visual check of the design tokens and UI kit. Removed before launch.
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import Select from '../../components/ui/Select.jsx';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';

const scale = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

// Full class names (not built dynamically) so Tailwind can detect them.
const brandBg = {
  50: 'bg-brand-50', 100: 'bg-brand-100', 200: 'bg-brand-200', 300: 'bg-brand-300', 400: 'bg-brand-400',
  500: 'bg-brand-500', 600: 'bg-brand-600', 700: 'bg-brand-700', 800: 'bg-brand-800', 900: 'bg-brand-900',
};
const accentBg = {
  50: 'bg-accent-50', 100: 'bg-accent-100', 200: 'bg-accent-200', 300: 'bg-accent-300', 400: 'bg-accent-400',
  500: 'bg-accent-500', 600: 'bg-accent-600', 700: 'bg-accent-700', 800: 'bg-accent-800', 900: 'bg-accent-900',
};

function Swatches({ title, classes }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-slate-600">{title}</p>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
        {scale.map((n) => (
          <div key={n} className="text-center text-xs text-slate-500">
            <div className={`h-12 rounded-lg ${classes[n]}`} />
            {n}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DesignPreview() {
  return (
    <main className="mx-auto max-w-5xl space-y-12 px-4 py-12">
      <h1 className="text-h1">Design tokens</h1>

      <section className="space-y-6">
        <h2 className="text-h2">Colors</h2>
        <Swatches title="brand (indigo)" classes={brandBg} />
        <Swatches title="accent (violet)" classes={accentBg} />
        <div className="h-16 rounded-card bg-gradient-to-r from-brand-600 to-accent-500" />
      </section>

      <section className="space-y-4">
        <h2 className="text-h2">Type scale</h2>
        <p className="text-display">Display</p>
        <p className="text-h1 font-bold">Heading 1</p>
        <p className="text-h2 font-bold">Heading 2</p>
        <p className="text-h3 font-bold">Heading 3</p>
        <p className="text-base text-slate-600">
          Body text in Inter. The quick brown fox jumps over the lazy dog. 0123456789
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-h2">Cards</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-card bg-white p-6 shadow-card">shadow-card</div>
          <div className="rounded-card bg-white p-6 shadow-card-hover">shadow-card-hover</div>
        </div>
        <p className="text-sm text-slate-500">Press Tab: links and buttons get a visible focus ring.</p>
        <a href="#" className="inline-block font-semibold text-brand-600">Focusable link</a>
      </section>

      <section className="space-y-6">
        <h2 className="text-h2">Button</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button loading>Sending</Button>
          <Button disabled>Disabled</Button>
          <Button as={Link} to="/">
            Link to home <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button as={Link} to="/" variant="outline" disabled>
            Disabled link
          </Button>
          <Button onClick={() => alert('clicked')}>Click me</Button>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-h2">Form fields</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <Input label="Full name" placeholder="Jane Doe" required />
          <Input label="Email" type="email" placeholder="jane@company.com" hint="We reply within 24 hours." />
          <Input label="Phone" error="Please enter a valid phone number." defaultValue="12ab" />
          <Input label="Company" disabled defaultValue="Disabled field" />
          <Select label="Project type" required>
            <option value="">Select a type</option>
            <option value="web">Web application</option>
            <option value="mobile">Mobile app</option>
            <option value="ecommerce">E-commerce</option>
          </Select>
          <Select label="Budget" error="Please choose a budget range.">
            <option value="">Select a range</option>
            <option value="small">Under $10k</option>
          </Select>
        </div>
        <Textarea label="Project description" hint="Tell us about your goals." placeholder="What are you building?" />
        <Textarea label="Message" error="Message must be at least 10 characters." defaultValue="Hi" rows={3} />
      </section>

      <section className="space-y-6">
        <h2 className="text-h2">Badge</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Neutral</Badge>
          <Badge variant="brand">Brand</Badge>
          <Badge variant="success">Won</Badge>
          <Badge variant="warning">Reviewing</Badge>
          <Badge variant="danger">Lost</Badge>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-h2">Card</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <Card>
            <h3 className="text-h3">Static card</h3>
            <p className="mt-2 text-slate-600">No hover effect.</p>
          </Card>
          <Card hover>
            <Badge variant="brand">Fintech</Badge>
            <h3 className="mt-3 text-h3">Hover card</h3>
            <p className="mt-2 text-slate-600">Lifts slightly on hover.</p>
          </Card>
          <Card as={Link} to="/" hover>
            <h3 className="text-h3">Link card</h3>
            <p className="mt-2 text-slate-600">The whole card is a link.</p>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-h2">Loading states</h2>
        <div className="flex items-center gap-4">
          <Spinner size="sm" />
          <Spinner />
          <Spinner size="lg" />
        </div>
        <Card className="space-y-3" aria-busy="true">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </Card>
      </section>
    </main>
  );
}
