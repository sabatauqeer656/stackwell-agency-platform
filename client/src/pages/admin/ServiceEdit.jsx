import IconContentEditor from '../../components/admin/IconContentEditor.jsx';
import { serviceConfig } from '../../features/admin/contentConfigs.js';

export default function ServiceEdit() {
  return <IconContentEditor config={serviceConfig} />;
}
