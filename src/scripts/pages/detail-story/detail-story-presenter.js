import StoryApi from "../../data/api";
import Auth from "../../utils/auth";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import IDBHelper from "../../utils/idb";

const generateNoImageFallback = () =>
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjODg4Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=";

export default class DetailStoryPresenter {
  async handlePageLoad() {
    const token = Auth.getToken();
    const container = document.getElementById("story-detail");
    const photoSection = document.getElementById("photo-section");

    // Check if the user is authenticated
    if (!token) {
      this._showMessage(container, "Lets login now to see the stories");
      return;
    }

    const storyId = this._getStoryIdFromUrl();

    try {
      const story = await this._fetchStoryDetail(storyId, token);

      if (!story) {
        this._showMessage(container, "Stories not available.");
        return;
      }

      const base64Image = await this._getImageFallback(story.photoUrl);
      this._renderStoryDetail(story, container, photoSection, base64Image);

      const toggleBtn = document.getElementById("toggle-offline-btn");
      await this._handleOfflineStory(story, base64Image, toggleBtn);
    } catch (err) {
      console.error("Failed:", err);
      this._showMessage(container, `Failed: ${err.message}`);
    }
  }

  // Extract story ID from URL
  _getStoryIdFromUrl() {
    const url = window.location.hash;
    return url.split("/")[2];
  }

  // Fetch story details from API
  async _fetchStoryDetail(storyId, token) {
    const { story } = await StoryApi.getStoryDetail({ id: storyId, token });
    return story;
  }

  // Fetch image or fallback image if not found
  async _getImageFallback(photoUrl) {
    if (!photoUrl) return generateNoImageFallback();

    try {
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      return await IDBHelper.convertBlobToBase64(blob);
    } catch (err) {
      console.warn("Failed:", err);
      return generateNoImageFallback(); // Return fallback image in case of failure
    }
  }

  // Render story details
  _renderStoryDetail(story, container, photoSection, base64Image) {
    photoSection.innerHTML = `
      <img src="${base64Image}" alt="Foto ${story.name}" loading="lazy" />
    `;

    const createdDate = new Date(story.createdAt).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    container.innerHTML = `
      <h2>${story.name}</h2>
      <p class="badge"> ${
        story.lat && story.lon
          ? `${story.lat.toFixed(5)}, ${story.lon.toFixed(5)}`
          : "Tidak ada lokasi"
      }</p>
      <p class="badge"> ${createdDate}</p>
      <p>${story.description}</p>
      <a href="#/" class="btn">Back now</a>
      <button id="toggle-offline-btn" class="btn"></button>
    `;

    if (story.lat && story.lon) {
      this.renderMap(story);
    } else {
      document.getElementById("map").innerHTML =
        "<p><em>Tidak ada lokasi</em></p>";
    }
  }

  // Handle toggling the offline story
  async _handleOfflineStory(story, base64Image, toggleBtn) {
    const updateButtonState = async () => {
      const existing = await IDBHelper.getStoryById(story.id);

      if (existing) {
        toggleBtn.textContent = "Delete from offline";
        toggleBtn.onclick = async () => {
          await IDBHelper.deleteStoryById(story.id);
          alert("Your stories have been delete on mode offline");
          updateButtonState(); // Refresh button state
        };
      } else {
        toggleBtn.textContent = "Saved mode offline";
        toggleBtn.onclick = async () => {
          const offlineStory = {
            ...story,
            offlineImage: base64Image,
            createdAt: story.createdAt || new Date().toISOString(),
          };
          await IDBHelper.saveStories([offlineStory]);
          alert("Your stories have been save at offline!");
          updateButtonState(); // Refresh button state
        };
      }
    };

    await updateButtonState();
  }

  // Render map if story has latitude and longitude
  renderMap(story) {
    const map = L.map("map").setView([story.lat, story.lon], 13);

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
    });

    const baseLayers = {
      OpenStreetMap: L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: "&copy; OpenStreetMap contributors" }
      ),
      "Citra Satelit": L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "Tiles © Esri" }
      ),
    };

    baseLayers["OpenStreetMap"].addTo(map);

    L.marker([story.lat, story.lon])
      .addTo(map)
      .bindPopup(
        `<b>${story.name}</b><br><small>${story.description.substring(
          0,
          50
        )}...</small>`
      )
      .openPopup();

    L.control.layers(baseLayers).addTo(map);
  }

  // Show message in the container
  _showMessage(container, message) {
    container.innerHTML = `<p>${message}</p><a href="#/" class="btn">Kembali ke Beranda</a>`;
  }
}
