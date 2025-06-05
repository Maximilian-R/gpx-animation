export class LeaderboardView {
  constructor(host, config) {
    this.element = host.createElement("div");
    this.element.classList.add("tp-leaderboard");

    this.listElement = host.createElement("ul");
    this.element.appendChild(this.listElement);

    const value = config.value;
    value.emitter.on("change", () => this.update(value.rawValue));
    this.create(value.rawValue);
  }

  sort(tracks) {
    return tracks
      .sort((a, b) => {
        if (a.completed && b.completed) {
          return a.last().time - b.last().time;
        }
        return a.completed === b.completed ? 0 : a.completed ? -1 : 1;
      })
      .sort((a, b) => (a.disabled === b.disabled ? 0 : a.disabled ? 1 : -1));
  }

  create(tracks) {
    const listItems = this.sort(tracks).map((track) => {
      const li = document.createElement("li");
      const div1 = document.createElement("div");
      const div2 = document.createElement("div");
      const div3 = document.createElement("div");
      const div4 = document.createElement("div");

      this.setContent(track, li, div1, div2, div3, div4);

      li.appendChild(div1);
      li.appendChild(div2);
      li.appendChild(div3);
      li.appendChild(div4);
      return li;
    });
    this.listElement.replaceChildren(...listItems);
  }

  update(tracks) {
    if (tracks.length !== this.listElement.childElementCount) {
      this.create(tracks);
      return;
    }
    this.sort(tracks).forEach((track, index) => {
      const [div1, div2, div3, div4] =
        this.listElement.children[index].children;
      this.setContent(
        track,
        this.listElement.children[index],
        div1,
        div2,
        div3,
        div4
      );
    });
  }

  setContent(track, li, div1, div2, div3, div4) {
    li.toggleAttribute("disabled", track.disabled);
    div1.setAttribute("title", new Date(track.trackData.time).toDateString());
    div1.textContent = track.index;
    div2.textContent = track.trackData.trackName ?? track.trackData.id;
    div2.setAttribute("title", div2.textContent);

    if (track.completed && !track.disabled) {
      const date = new Date(track.duration);
      const distance = track.distance / 1000;
      const options = { minimumIntegerDigits: 2 };
      // div4.textContent = `${date.getUTCHours()}h ${date.getMinutes()}min ${date.getSeconds()}s`;
      div3.textContent = `${distance.toLocaleString("en-US", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      })}km`;
      div4.textContent = `${date
        .getUTCHours()
        .toLocaleString("en-US", options)}:${date
        .getMinutes()
        .toLocaleString("en-US", options)}:${date
        .getSeconds()
        .toLocaleString("en-US", options)}`;
    } else {
      div3.textContent = "";
      div4.textContent = `${Math.trunc(track.speed())}km/h`;
    }
  }
}
