import ContentList from '../../components/admin/ContentList.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import { useAdminTeam } from '../../features/admin/team.js';

export default function Team() {
  return (
    <ContentList
      title="Team"
      intro="The people shown on the About page, in order."
      noun="team member"
      plural="team members"
      useData={useAdminTeam}
      adminPath="/admin/team"
      searchHint="Name"
      emptyHint="Add the first person. They appear on the About page once published."
      renderRow={(member) => (
        <>
          <Avatar name={member.name} src={member.photo} />
          <span className="min-w-0">
            <span className="block truncate font-semibold text-ink">{member.name}</span>
            <span className="block truncate text-sm text-slate-500">{member.role}</span>
          </span>
        </>
      )}
    />
  );
}
