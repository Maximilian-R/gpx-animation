const SETTINGS = {
  leaderboard: [],
  theme: 0,
  speed: 100,
  timeline: 0,
  files: [],
  render: {
    paths: false,
    markers: true,
  },
  camera: {
    mode: 0,
    target: 0,
  },
  filter: {
    date: {
      on: false,
      from: "2000-01-01",
      to: "2025-01-01",
    },
    start: {
      on: false,
      latlng: { x: 0, y: 0 },
      radius: 500,
    },
    through: {
      on: false,
      latlng: { x: 0, y: 0 },
      radius: 500,
    },
    end: {
      on: false,
      latlng: { x: 0, y: 0 },
      radius: 500,
    },
  },
  transform: {
    normalize: true,
    removePauses: false,
    removeWaiting: false,
    trimStart: 0,
    trimEnd: 0,
  },
};

export default SETTINGS;
