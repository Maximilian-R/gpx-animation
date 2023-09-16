import SETTINGS from "./Settings.js";

export default class RadiusFilter {
  constructor(map, animator, property, fill) {
    this.map = map;
    this.animator = animator;
    this.settings = SETTINGS.filter[property];

    this.marker = L.circle(this.map.getCenter(), {
      radius: this.settings.radius,
      color: fill,
      weight: 4,
      fillOpacity: 0.2,
      dashArray: 16,
    });
    this.settings.latlng = {
      x: 0,
      y: 0,
    };

    const onMove = (event) => this.move(event.latlng);
    this.marker.on("mousedown", () => {
      this.map.dragging.disable();
      this.map.on("mousemove", onMove);
    });
    this.marker.on("mouseup", () => {
      this.map.dragging.enable();
      this.map.off("mousemove", onMove);
      this.animator.applyFilter();
      this.animator.gui.settingsPane.refresh();
    });
  }

  get latlng() {
    return this.marker.getLatLng();
  }

  get on() {
    return this.settings.on;
  }

  get radius() {
    return this.marker.getRadius();
  }

  setOn(state) {
    if (state) this.add();
    else this.remove();
    this.animator.applyFilter();
  }

  setRadius(radius) {
    this.resize(radius);
    this.animator.applyFilter();
  }

  setPosition(latlng) {
    this.move(latlng);
    this.animator.applyFilter();
  }

  resize(radius) {
    this.marker.setRadius(radius);
    this.settings.radius = radius;
  }

  move(latlng) {
    this.marker.setLatLng(latlng);
    this.settings.latlng = { x: latlng.lat, y: latlng.lng };
  }

  add() {
    if (this.settings.latlng.x === 0 && this.settings.latlng.y === 0) {
      this.setPosition({
        lat: this.map.getCenter().lat,
        lng: this.map.getCenter().lng,
      });
      this.animator.gui.settingsPane.refresh();
    }
    this.marker.addTo(this.map);
  }

  remove() {
    this.marker.remove();
  }

  match(latLng) {
    return this.on ? this.latlng.distanceTo(latLng) <= this.radius : true;
  }
}
