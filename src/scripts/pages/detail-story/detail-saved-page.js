import Auth from "../../utils/auth";

export default class DetailSavedStory {
  async handlePageLoad() {
    const container = document.getElementById("story-detail");
    const photoSection = document.getElementById("photo-section");
    const token = Auth.getToken();

    // Handle case if the user is not logged in
    if (!token) {
      this._showMessage(container, "Login terlebih dahulu");
      return;
    }

    const storyId = this._getStoryIdFromURL();

    try {
      const story = await this._fetchStory(storyId);

      if (!story) {
        this._showMessage(container, "Story tidak di tembukan");
        return;
      }

      this._renderStoryDetails(story, container, photoSection);
    } catch (err) {
      console.error("Error:", err);
      this._showMessage(container, `Error: ${err.message}`);
    }
  }

  // Extract story ID from URL
  _getStoryIdFromURL() {
    const url = window.location.hash;
    return url.split("/")[2];
  }

  // Fetch story details from IndexedDB
  async _fetchStory(storyId) {
    const { default: IDBHelper } = await import("../../utils/idb.js");
    const stories = await IDBHelper.getAllStories();
    return stories.find((s) => s.id === storyId);
  }

  // Render story details to the page
  _renderStoryDetails(story, container, photoSection) {
    photoSection.innerHTML = `
      <img src="${story.offlineImage}" alt="Photo of ${story.name}" />
    `;

    container.innerHTML = `
      <h2>${story.name}</h2>
      <p class="badge">${
        story.lat && story.lon
          ? `${story.lat.toFixed(3)}, ${story.lon.toFixed(3)}`
          : "No Location"
      }</p>
      <p>${story.description}</p>
      <a href="#/" class="btn">kembali</a>
    `;
  }

  // Show message in the container
  _showMessage(container, message) {
    container.innerHTML = `<p>${message}</p><a href="#/" class="btn">Back</a>`;
  }
}
