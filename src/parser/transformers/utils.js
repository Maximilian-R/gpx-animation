export function toSeconds(ms) {
  return ms / 1000;
}

export function duration(previous, current) {
  return current.time - previous.time;
}

export function distance(map, previous, current) {
  return map.distance(previous, current);
}
