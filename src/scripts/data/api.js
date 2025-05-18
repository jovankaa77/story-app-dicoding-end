import { CONFIG } from "../config";

const API_ENDPOINT = CONFIG.BASE_URL;

async function fetchData(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_ENDPOINT}${endpoint}`, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Request failed");
    }

    return response.json();
  } catch (error) {
    console.error("API Request Error:", error);
    throw new Error(`Failed to fetch data from ${endpoint}: ${error.message}`);
  }
}

const StoryApi = {
  login: ({ email, password }) =>
    fetchData("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }),

  register: ({ name, email, password }) =>
    fetchData("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    }),

  getStories: ({ token, page = 1, size = 100 }) =>
    fetchData(`/stories?page=${page}&size=${size}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  getStoryDetail: async ({ id, token }) => {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new Error("Invalid story ID format");
    }

    return fetchData(`/stories/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  addStory: ({ token, data }) =>
    fetchData("/stories", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: data,
    }),

  addStoryGuest: (data) =>
    fetchData("/stories/guest", {
      method: "POST",
      body: data,
    }),
};

export default StoryApi;
