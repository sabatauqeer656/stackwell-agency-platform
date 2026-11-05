// TEMPORARY: visual check of the layout blocks. Removed before launch.
import PageHeader from '../../components/layout/PageHeader.jsx';
import Section from '../../components/layout/Section.jsx';
import SectionHeading from '../../components/layout/SectionHeading.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';

const items = ['Discover', 'Design', 'Build'];

export default function LayoutPreview() {
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Software that moves your business forward"
        description="PageHeader owns the page's single h1. It sits on a soft gradient and can hold extra content below."
      >
        <Button>Get a quote</Button>
      </PageHeader>

      <Section>
        <SectionHeading
          eyebrow="How we work"
          title="A white section"
          description="Centered heading with an eyebrow label and a description."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {items.map((item) => (
            <Card key={item}>
              <h3 className="text-h3">{item}</h3>
              <p className="mt-2 text-slate-600">Content inside a Container, inside a Section.</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading align="left" title="A muted section, left-aligned" description="Background runs edge to edge." />
      </Section>

      <Section tone="dark">
        <SectionHeading onDark eyebrow="Dark" title="A dark section" description="onDark keeps the text readable." />
      </Section>

      <Section containerSize="md">
        <SectionHeading title="Narrow container" description="size='md' keeps long text at a readable width." />
      </Section>
    </>
  );
}
