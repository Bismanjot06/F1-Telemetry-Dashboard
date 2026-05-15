export const tireData = [
  {
    driver: 'VER',
    compound: 'M',
    age: 12,
    degradation: 34,
    pitWindow: '8–12',
    temp: { inner: 98, outer: 82, surface: 90 },
    pressure: 23.4,
  },
  {
    driver: 'LEC',
    compound: 'S',
    age: 8,
    degradation: 51,
    pitWindow: '4–7',
    temp: { inner: 112, outer: 96, surface: 104 },
    pressure: 22.8,
  },
  {
    driver: 'NOR',
    compound: 'S',
    age: 5,
    degradation: 28,
    pitWindow: '8–11',
    temp: { inner: 105, outer: 89, surface: 97 },
    pressure: 23.1,
  },
  {
    driver: 'HAM',
    compound: 'M',
    age: 18,
    degradation: 62,
    pitWindow: 'NOW',
    temp: { inner: 88, outer: 71, surface: 80 },
    pressure: 24.1,
  },
];

export const compoundMeta = {
  S: { label: 'SOFT',   color: '#ff1e1e', bg: 'rgba(255,30,30,0.15)',   ring: '#ff1e1e' },
  M: { label: 'MEDIUM', color: '#ffe600', bg: 'rgba(255,230,0,0.12)',   ring: '#ffe600' },
  H: { label: 'HARD',   color: '#c8cdd4', bg: 'rgba(200,205,212,0.12)', ring: '#c8cdd4' },
  I: { label: 'INTER',  color: '#00e5ff', bg: 'rgba(0,229,255,0.15)',   ring: '#00e5ff' },
  W: { label: 'WET',    color: '#3d7fff', bg: 'rgba(61,127,255,0.15)',  ring: '#3d7fff' },
};
