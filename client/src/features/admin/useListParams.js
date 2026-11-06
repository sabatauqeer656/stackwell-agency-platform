import { useSearchParams } from 'react-router-dom';

// ?page=abc, ?page=0 or ?page=-3 all fall back to page 1
const parsePage = (value) => {
  const number = Number.parseInt(value ?? '', 10);
  return Number.isInteger(number) && number >= 1 ? number : 1;
};

// The state of a dashboard list (page, status filter, search text) lives in the ADDRESS:
// /admin/inquiries?status=new&q=pricing&page=2
// So a filtered view can be bookmarked or shared, a refresh keeps it, and the Back button steps through it.
// Values from the address bar can be anything, so they are checked before use.
export function useListParams(allowedStatuses) {
  const [searchParams, setSearchParams] = useSearchParams();

  const requestedStatus = searchParams.get('status') ?? '';
  const params = {
    page: parsePage(searchParams.get('page')),
    status: allowedStatuses.includes(requestedStatus) ? requestedStatus : '',
    search: (searchParams.get('q') ?? '').trim().slice(0, 100),
  };

  // Change some parameters and keep the others. An empty value removes the parameter.
  const update = (changes) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setSearchParams(next);
  };

  return {
    ...params,
    // a new filter or search always starts again from page 1
    setStatus: (status) => update({ status, page: '' }),
    setSearch: (search) => update({ q: search, page: '' }),
    setPage: (page) => update({ page: page > 1 ? String(page) : '' }),
    clear: () => update({ status: '', q: '', page: '' }),
  };
}
