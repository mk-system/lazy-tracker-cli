export default {
  '*.{ts,tsx}': (filenames) => {
    const filtered = filenames.filter((f) => !f.includes('src/api/__generated__/'));
    if (filtered.length === 0) return [];
    return [`eslint --fix ${filtered.join(' ')}`, `prettier --write ${filtered.join(' ')}`];
  },
  '*.{json,md}': ['prettier --write'],
};
