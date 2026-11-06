import IconContentEditor from '../../components/admin/IconContentEditor.jsx';
import { solutionConfig } from '../../features/admin/contentConfigs.js';

export default function SolutionEdit() {
  return <IconContentEditor config={solutionConfig} />;
}
