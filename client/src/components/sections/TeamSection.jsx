import Section from '../layout/Section.jsx';
import SectionHeading from '../layout/SectionHeading.jsx';
import QueryState from '../ui/QueryState.jsx';
import SkeletonGrid from '../ui/SkeletonGrid.jsx';
import TeamMemberCard from './TeamMemberCard.jsx';
import { useTeam } from '../../features/team/useTeam.js';

export default function TeamSection() {
  const query = useTeam();

  return (
    <Section aria-labelledby="team-heading">
      <SectionHeading
        id="team-heading"
        eyebrow="The team"
        title="The people behind your project"
        description="A small, senior team. The people you meet in the first call are the people who build your product."
      />
      <div className="mt-12">
        <QueryState
          query={query}
          skeleton={<SkeletonGrid count={4} label="Loading team" gridClass="sm:grid-cols-2 lg:grid-cols-4" />}
          errorTitle="We could not load our team"
          emptyTitle="Our team page is coming soon"
        >
          {(team) => (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((member) => (
                <li key={member._id} className="flex">
                  <TeamMemberCard member={member} />
                </li>
              ))}
            </ul>
          )}
        </QueryState>
      </div>
    </Section>
  );
}
