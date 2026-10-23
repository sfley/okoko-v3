// Compile-time flag: demo data is removed from production builds.
export const isDemo = import.meta.env.VITE_OKOKO_DEMO === true;
export const currentPath = () => isDemo ? (location.hash.startsWith('#/') ? location.hash.slice(1) : '/') : location.pathname;
export const pageHref = (path) => isDemo ? `#${path}` : path;
