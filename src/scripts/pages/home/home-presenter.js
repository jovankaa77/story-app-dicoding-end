import StoryApi from "../../data/api";
import Auth from "../../utils/auth";

export default class HomePresenter {
  async showStories() {
    const container = document.getElementById("stories-container");
    const loadingEl = document.getElementById("loading-home");
    const token = Auth.getToken();

    if (!token) {
      return this._displayLoginMessage(container);
    }

    this._showLoading(loadingEl, true);

    try {
      const data = await StoryApi.getStories({ token });
      this._showLoading(loadingEl, false);

      if (data.listStory.length > 0) {
        this._renderStories(container, data.listStory);
      } else {
        this._displayNoStoriesMessage(container);
      }
    } catch (err) {
      this._showLoading(loadingEl, false);
      this._displayErrorMessage(container, err);
    }
  }

  // Display message if the user is not logged in
  _displayLoginMessage(container) {
    container.innerHTML = '<p class="text-center">Login tidak tersedia</p>';
  }

  // Show or hide the loading element
  _showLoading(loadingEl, isLoading) {
    loadingEl.style.display = isLoading ? "flex" : "none";
  }

  // Render the stories inside the container
  _renderStories(container, stories) {
    container.innerHTML = stories
      .map((story, index) => this._createStoryCard(story, index))
      .join("");
  }

  // Create individual story card HTML
  _createStoryCard(story, index) {
    if (!story.id || typeof story.id !== "string") return "";

    const formattedDate = this._formatDate(story.createdAt);
    const truncatedDescription = this._truncateDescription(story.description);

    return `
      <article class="story-card" style="animation-delay: ${index * 0.1}s">
        <img src="${
          story.photoUrl || this._getPlaceholderImage()
        }" alt="Story by ${story.name}">
        <div class="story-content">
          <h2>${story.name}</h2>
          <p>${truncatedDescription}</p>
          <small style="color: var(--text-muted); font-size: 0.85rem;">${formattedDate}</small>
          <a href="#/detail/${story.id}" class="btn-detail">View</a>
        </div>
      </article>
    `;
  }

  // Format the date into a readable format
  _formatDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // Truncate description to 100 characters
  _truncateDescription(description) {
    return `${description.slice(0, 100)}${
      description.length > 100 ? "..." : ""
    }`;
  }

  // Return a placeholder image URL if no photo URL is provided
  _getPlaceholderImage() {
    return "https://via.placeholder.com/400x200?text=No+Image";
  }

  // Display a message when there are no stories
  _displayNoStoriesMessage(container) {
    container.innerHTML = '<p class="text-center">Tidak ada story</p>';
  }

  // Display an error message if the API call fails
  _displayErrorMessage(container, error) {
    container.innerHTML = `
      <div class="error-message">
        <p class="text-center">Story failed: ${error.message}</p>
      </div>
    `;
    console.error("Story failed:", error);
  }
}
