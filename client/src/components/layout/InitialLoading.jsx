import Spinner from '../ui/Spinner.jsx';

// Shown only while the code of the very first page is still downloading.
export default function InitialLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
