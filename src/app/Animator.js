import RadiusFilter from "./RadiusFilter.js";
import SETTINGS from "./Settings.js";
import Track from "./Track.js";

import normalizeTime from "../parser/transformers/normalizeTime.js";
import removePauses from "../parser/transformers/removePauses.js";
import removeWaiting from "../parser/transformers/removeWaiting.js";
import DateRangeFilter from "./DateRangeFilter.js";
// import trimStartEnd from "../parser/transformers/trimStartEnd.js";

export default class Animator {
  constructor(gui, map) {
    this.gui = gui;
    this.map = map;
    this.files = [];
    this.tracks = [];
    this.enabledTracks = [];
    this.time = 0;
    this.timeout;
    this.eventListeners = [];
    this.isPlaying = false;
    this.animationRequestId;

    this.currentTime;
    this.lastTime = 0;

    this.startFilter = new RadiusFilter(this.map, this, "start", "#66ebce");
    this.throughFilter = new RadiusFilter(this.map, this, "through", "#b466eb");
    this.endFilter = new RadiusFilter(this.map, this, "end", "#ee64c7");
    this.dateFilter = new DateRangeFilter(this, "date");

    this.map.on("mousedown", () => {
      SETTINGS.camera.mode = 2;
      this.gui.leaderboardPane.refresh();
    });

    this.gui.initialise(this);
  }

  applyTransformers() {
    // remove current tracks
    this.tracks.forEach((track) => track.destroy());

    let files = this.files;
    if (SETTINGS.transform.normalize) files = normalizeTime(files);
    if (SETTINGS.transform.removePauses) files = removePauses(files);
    if (SETTINGS.transform.removeWaiting)
      files = removeWaiting(this.map, files);
    // files = trimStartEnd(this.map, files);

    //create new tracks
    this.tracks = files.map((file, index) => new Track(this, file, index));
    this.applyFilter();
  }

  applyFilter() {
    this.tracks.forEach((track) => {
      track.disabled =
        !this.startFilter.match(track.first()) ||
        !this.endFilter.match(track.last()) ||
        !track.points.some((point) => this.throughFilter.match(point)) ||
        !this.dateFilter.match(track);
    });

    this.enabledTracks = this.tracks.filter((track) => !track.disabled);
    this.update(true);
    this.gui.timelinePane.initialise(this);
  }

  add(files) {
    const newFiles = files.filter((file) => !this.files.includes(file));
    this.files = [...this.files, ...newFiles];
    this.applyTransformers();
  }

  remove(removeFile) {
    const removeFileIndex = this.files.findIndex((file) => file === removeFile);

    const track = this.tracks[removeFileIndex];
    if (track) {
      track.destroy();
      this.files.splice(removeFileIndex, 1);
      this.tracks.splice(removeFileIndex, 1);
      this.applyFilter();
    }
  }

  maxDuration() {
    return this.enabledTracks.length > 0
      ? Math.max(...this.enabledTracks.map((track) => track.duration))
      : 100;
  }

  addEventListener(listener) {
    this.eventListeners.push(listener);
  }

  dispatch() {
    this.eventListeners.forEach((listener) => listener());
  }

  setTime(time, stop = true) {
    // if (stop) this.stop();
    if (this.ignoreSetTime) {
      // currently running in nextFrame, updating timelinepane. Only act on user changes. Since the timeline has a step of 100, it causes problems if the "running time" sets time via this change
      return;
    }
    this.time = time;
    this.update();
  }

  update(force = false) {
    if (this.isPlaying && this.updateCalled) {
      console.warn("Update was called twice in a single frame");
    } else {
      this.updateCalled = true;
    }
    this.updateTracks(force);
    this.updateCamera();
  }

  nextFrame(currentTime) {
    this.updateCalled = false;
    this.currentTime = currentTime;

    this.time += (currentTime - this.lastTime) * SETTINGS.speed;
    this.update();

    this.ignoreSetTime = true;
    SETTINGS.timeline = this.time;
    this.gui.timelinePane.refresh();
    this.ignoreSetTime = false;

    this.lastTime = currentTime;

    if (!this.isPlaying) return; // stop was called
    this.animationRequestId = window.requestAnimationFrame((currentTime) => {
      this.nextFrame(currentTime);
    });
  }

  play() {
    this.animationRequestId = window.requestAnimationFrame((currentTime) => {
      this.lastTime = currentTime;
      this.nextFrame(currentTime);
    });
    this.isPlaying = true;
    this.dispatch();
  }

  stop() {
    window.cancelAnimationFrame(this.animationRequestId);
    this.isPlaying = false;
    this.dispatch();
  }

  updateTracks(force = false) {
    this.enabledTracks.forEach((track) => track.update(this.time, force));

    SETTINGS.leaderboard = [...this.tracks];
    this.gui.leaderboardPane.refresh();

    if (this.enabledTracks.every((track) => track.completed)) this.stop();
  }

  updateCamera() {
    switch (SETTINGS.camera.mode) {
      case 0:
        const currentLocations = this.enabledTracks.map((track) =>
          track.current()
        );
        if (currentLocations.length === 0) break;
        const bounds = L.latLngBounds(currentLocations);
        this.map.fitBounds(bounds, {
          // animate: true,
          // duration: 0.25,
          maxZoom: 14,
          padding: L.point(100, 100),
        });
        break;
      case 1:
        const target = this.tracks.find(
          (track) => track.index === SETTINGS.camera.target
        );
        if (!target) break;
        this.map.panTo(target.marker._latlng, {
          // animate: true,
          // duration: 0.25,
          maxZoom: 14,
          padding: L.point(100, 100),
        });
      case 2:
        break;
    }
  }
}
