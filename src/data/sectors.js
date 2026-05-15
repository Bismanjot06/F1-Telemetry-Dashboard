export const sectorData = {
  VER: {
    s1: { current: '28.142', personal: '27.991', session: '27.814' },
    s2: { current: '34.218', personal: '33.987', session: '33.801' },
    s3: { current: '28.885', personal: '28.640', session: '28.512' },
  },
  LEC: {
    s1: { current: '28.391', personal: '28.201', session: '27.814' },
    s2: { current: '34.412', personal: '34.118', session: '33.801' },
    s3: { current: '28.815', personal: '28.711', session: '28.512' },
  },
  NOR: {
    s1: { current: '28.512', personal: '28.310', session: '27.814' },
    s2: { current: '34.580', personal: '34.251', session: '33.801' },
    s3: { current: '28.800', personal: '28.724', session: '28.512' },
  },
  HAM: {
    s1: { current: '28.701', personal: '28.490', session: '27.814' },
    s2: { current: '34.712', personal: '34.380', session: '33.801' },
    s3: { current: '28.691', personal: '28.598', session: '28.512' },
  },
};

// Returns classification for a sector time
export const classifySector = (current, personal, session) => {
  const c = parseFloat(current);
  const p = parseFloat(personal);
  const s = parseFloat(session);
  if (c <= s) return 'session'; // purple — session best
  if (c <= p) return 'best';    // green  — personal best
  return 'avg';                 // yellow — slower
};
