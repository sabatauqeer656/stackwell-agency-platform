// Framer Motion's animation engine, kept in its own file so it can be downloaded on demand
// (see LazyMotion in app/providers.jsx) instead of being part of the first page load.
export { domAnimation as default } from 'framer-motion';
