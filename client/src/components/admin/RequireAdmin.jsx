import RequireAuth from './RequireAuth.jsx';

// For pages only administrators may open (site settings, for example). Editors who type the address by hand
// see a "no access" screen. Remember: this only controls the SCREEN. The API refuses editors on its own.
export default function RequireAdmin() {
  return <RequireAuth roles={['admin']} />;
}
