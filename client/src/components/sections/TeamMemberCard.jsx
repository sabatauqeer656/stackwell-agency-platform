import Card from '../ui/Card.jsx';
import Avatar from '../ui/Avatar.jsx';
import { ExternalLink } from 'lucide-react';

const socials = [
  ['linkedin', 'LinkedIn'],
  ['github', 'GitHub'],
];

export default function TeamMemberCard({ member }) {
  // Only the links an admin has filled in
  const links = socials.filter(([key]) => member[key]).map(([key, label]) => ({ label, href: member[key] }));

  return (
    <Card className="flex h-full w-full flex-col">
      <Avatar name={member.name} src={member.photo} size="lg" />
      <h3 className="mt-5 text-xl">{member.name}</h3>
      <p className="text-sm font-medium text-brand-700">{member.role}</p>
      <p className="mt-3 flex-1 text-slate-600">{member.bio}</p>

      {links.length > 0 && (
        <ul className="mt-5 flex gap-4" aria-label={`${member.name} on the web`}>
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"
              >
                {link.label}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="sr-only">
                  , {member.name} (opens in a new tab)
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
