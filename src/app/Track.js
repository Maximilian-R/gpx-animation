import SETTINGS from "./Settings.js";

export default class Track {
  constructor(animator, gpx, index) {
    this.animator = animator;
    this.map = this.animator.map;
    this.gpx = gpx;
    this.index = index;
    this.completed = false;
    this.tick = 0;
    this.lastTick = 0;
    this._disabled = false;

    this.polyLine = L.polyline(false, {
      color: "#40ffff",
      opacity: 0.5,
      weight: 3,
    });

    this.marker = L.marker(this.first(), {
      icon: L.divIcon({
        html: `<i id="marker-${index}" class='marker'>${index}</i>`,
        iconSize: L.point(24, 24),
      }),
      interactive: false,
    });
  }

  get date() {
    return this.gpx.meta.time.slice(0, 10);
  }

  get points() {
    return this.gpx.points;
  }

  get distance() {
    return this.gpx.distance;
  }

  get duration() {
    const start = new Date(this.gpx.points.at(0).time);
    const end = new Date(this.gpx.points.at(-1).time);
    return Math.abs(end - start);
  }

  set disabled(value) {
    this._disabled = value;
    this.setVisible(!this.disabled);
  }

  get disabled() {
    return this._disabled;
  }

  remove() {
    this.animator.remove(this);
  }

  destroy() {
    this.setVisible(false);
  }

  setVisible(visible) {
    if (visible) {
      this.polyLine.addTo(this.map);
      this.marker.addTo(this.map);
    } else {
      this.polyLine.remove();
      this.marker.remove();
    }
  }

  update(time, force = false) {
    if (this.completed) {
      if (time < this.duration) {
        this.onComplete(false);
      } else return;
    }

    while (time > this.next().time && this.tick < this.points.length - 1) {
      this.tick++;
    }
    while (time < this.current().time && this.tick > 0) {
      this.tick--;
    }

    this.updatePolyLine(force);
    this.updateMarker(time);

    if (time >= this.duration) {
      this.onComplete(true);
    }

    this.lastTick = this.tick;
  }

  updatePolyLine(force = false) {
    if (this.lastTick !== this.tick || force) {
      this.polyLine.setLatLngs(
        SETTINGS.render.paths ? this.points.slice(0) : false
      );
    }
  }

  updateMarker(time) {
    const current = this.current();
    const next = this.next();
    const difference = next.time - current.time;
    let position;
    if (difference === 0) {
      position = current;
    } else {
      const fraction = (time - current.time) / difference;
      position = L.Motion.Utils.interpolateOnLatLngSegment(
        current,
        next,
        fraction
      );
    }
    this.marker.setLatLng(position);
    this.marker._icon.childNodes[0].textContent = this.index;
  }

  onComplete(state) {
    this.completed = state;
    this.marker._icon.childNodes[0].classList.toggle("finished", state);
  }

  speed() {
    if (this.previous() != this.current()) {
      const distance = this.map.distance(this.previous(), this.current());
      const duration = this.current().time - this.previous().time;
      return distance / 1000 / (duration / 1000 / 60 / 60);
    }
    return 0;
  }

  first() {
    return this.points.at(0);
  }

  last() {
    return this.points.at(-1);
  }

  current() {
    return this.points[this.tick] ?? this.first();
  }

  next() {
    return this.points[this.tick + 1] ?? this.current();
  }

  previous() {
    return this.points[this.tick - 1] ?? this.current();
  }

  distanceToFinishLine() {
    return this.map.distance(this.current(), this.last());
  }
}
