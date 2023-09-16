export default class Map {
  static API_KEY = "076c702d09534bef9bf95ace9b1dc9a4";
  static TILE_LAYERS = [
    `https://maps.geoapify.com/v1/tile/positron/{z}/{x}/{y}.png?apiKey=${Map.API_KEY}`,
    `https://maps.geoapify.com/v1/tile/dark-matter/{z}/{x}/{y}.png?apiKey=${Map.API_KEY}`,
    `https://maps.geoapify.com/v1/tile/dark-matter-brown/{z}/{x}/{y}.png?apiKey=${Map.API_KEY}`,
    `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${Map.API_KEY}`,
  ];

  constructor() {
    this.map = L.map("map").setView([59.2859, 18.2788], 14);
    this.tileLayer;
    this.setTileLayer(0);
  }

  setTileLayer(index) {
    const layer = Map.TILE_LAYERS[index];
    if (this.tileLayer) this.tileLayer.removeFrom(this.map);
    this.tileLayer = L.tileLayer(layer, {
      attribution:
        'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | <a href="https://openmaptiles.org/" target="_blank">© OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap</a> contributors',
      maxZoom: 20,
      id: "osm-bright",
    });
    this.tileLayer.addTo(this.map);
  }
}
