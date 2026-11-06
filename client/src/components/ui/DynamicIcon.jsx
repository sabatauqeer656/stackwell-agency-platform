import {
  Briefcase,
  Code,
  Database,
  GraduationCap,
  HeartPulse,
  Landmark,
  Layers,
  LifeBuoy,
  Palette,
  Server,
  ShoppingCart,
  Smartphone,
  Store,
} from 'lucide-react';

// The database stores an icon as TEXT (e.g. "Smartphone"), but React needs the component itself.
// This lookup turns one into the other. Only the icons listed here end up in the bundle:
// importing all of lucide dynamically would add hundreds of kilobytes.
// To support a new icon name in the admin dashboard, add it here.
const icons = { Briefcase, Code, Database, GraduationCap, HeartPulse, Landmark, Layers, LifeBuoy, Palette, Server, ShoppingCart, Smartphone, Store };

// The names an editor can choose from in the dashboard
export const iconNames = Object.keys(icons);

export default function DynamicIcon({ name, ...props }) {
  const Icon = icons[name] ?? Layers; // unknown name -> a safe default instead of a crash
  return <Icon aria-hidden="true" {...props} />;
}
