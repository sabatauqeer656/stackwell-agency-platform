import LeadList from '../../components/admin/LeadList.jsx';
import { INQUIRY_STATUSES, useInquiries } from '../../features/admin/inquiries.js';
import { cn } from '../../lib/utils.js';

export default function Inquiries() {
  return (
    <LeadList
      title="Inquiries"
      intro="Messages sent through the contact form."
      noun="inquiry"
      plural="inquiries"
      statuses={INQUIRY_STATUSES}
      useData={useInquiries}
      basePath="/admin/inquiries"
      searchHint="Name, email, subject or company"
      emptyHint="Messages sent through the contact form appear here."
      renderRow={(inquiry) => (
        <>
          <p className={cn('truncate text-ink', inquiry.status === 'new' ? 'font-bold' : 'font-semibold')}>{inquiry.name}</p>
          <p className="truncate text-sm text-slate-500">{inquiry.email}</p>
          <p className="mt-1 truncate text-slate-800">{inquiry.subject}</p>
          <p className="truncate text-sm text-slate-500">{inquiry.message}</p>
        </>
      )}
    />
  );
}
