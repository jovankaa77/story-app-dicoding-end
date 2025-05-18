import { openDB } from "idb";

const DB_NAME = "story-app-db";
const DB_VERSION = 1;
const STORE_NAME = "stories";

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: "id" });
    }
  },
});

const generateNoImageFallback = () =>
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjODg4Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=";

const IDBHelper = {
  /**
   * Saves an array of stories to IndexedDB, enriching them with base64 images.
   * @param {Array} stories - List of stories to be saved.
   */
  async saveStories(stories) {
    const enrichedStories = await this._enrichStoriesWithImage(stories);

    const db = await dbPromise;
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    for (const story of enrichedStories) {
      await store.put(story);
    }

    await tx.done;
  },

  /**
   * Retrieves all stories from IndexedDB.
   * @returns {Promise<Array>} A list of all stories.
   */
  async getAllStories() {
    const db = await dbPromise;
    return db.getAll(STORE_NAME);
  },

  /**
   * Deletes a story by its ID from IndexedDB.
   * @param {string} id - The ID of the story to be deleted.
   */
  async deleteStory(id) {
    const db = await dbPromise;
    await db.delete(STORE_NAME, id);
  },

  /**
   * Retrieves a story by its ID from IndexedDB.
   * @param {string} id - The ID of the story to retrieve.
   * @returns {Promise<Object>} The story data.
   */
  async getStoryById(id) {
    const db = await dbPromise;
    return db.get(STORE_NAME, id);
  },

  /**
   * Deletes a story by its ID from IndexedDB.
   * @param {string} id - The ID of the story to delete.
   */
  async deleteStoryById(id) {
    const db = await dbPromise;
    await db.delete(STORE_NAME, id);
  },

  /**
   * Converts a Blob object to a base64 encoded string.
   * @param {Blob} blob - The Blob object to convert.
   * @returns {Promise<string>} The base64 encoded string.
   */
  convertBlobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  },

  /**
   * Enriches the stories with base64 images, falling back to a placeholder if necessary.
   * @param {Array} stories - The stories to enrich.
   * @returns {Promise<Array>} The enriched list of stories.
   */
  async _enrichStoriesWithImage(stories) {
    return Promise.all(
      stories.map(async (story) => {
        let base64Image = generateNoImageFallback();

        if (story.photoUrl) {
          try {
            base64Image = await this._fetchAndConvertImage(story.photoUrl);
          } catch (err) {
            console.warn("Failed to fetch image:", err);
          }
        }

        return {
          ...story,
          offlineImage: base64Image,
          lat: story.lat,
          lon: story.lon,
          createdAt: story.createdAt || new Date().toISOString(),
        };
      })
    );
  },

  /**
   * Fetches an image from a URL and converts it to a base64 string.
   * @param {string} url - The URL of the image to fetch.
   * @returns {Promise<string>} The base64 encoded image.
   */
  async _fetchAndConvertImage(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return this.convertBlobToBase64(blob);
  },
};

export default IDBHelper;
