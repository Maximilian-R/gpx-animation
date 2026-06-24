const SETTINGS = {
  leaderboard: [],
  theme: 0,
  speed: 25,
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
      color: "#66ebce",
    },
    through: {
      on: false,
      latlng: { x: 0, y: 0 },
      radius: 500,
      color: "#b466eb",
    },
    end: {
      on: false,
      latlng: { x: 0, y: 0 },
      radius: 500,
      color: "#ee64c7",
    },
  },
  transform: {
    normalize: true,
    averageSpeed: true,
    removePauses: false,
    removeWaiting: false,
    trimStart: 0,
    trimEnd: 0,
  },
};

export default SETTINGS;
