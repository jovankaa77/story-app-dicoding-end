const UrlParser = {
  /**
   * Parse the active URL with the resource and optional ID, combining them into a full URL.
   * @returns {string} The combined URL path.
   */
  parseActiveUrlWithCombiner() {
    const url = this._getCurrentUrl();
    const urlSegments = this._splitUrl(url);
    return this._combineUrl(urlSegments);
  },

  /**
   * Parse the active URL into an object containing resource and ID.
   * @returns {Object} An object with resource and id.
   */
  parseActiveUrlWithoutCombiner() {
    const url = this._getCurrentUrl();
    const urlSegments = this._splitUrl(url);
    return {
      resource: urlSegments.resource || null,
      id: urlSegments.id || null,
    };
  },

  /**
   * Get the current URL path from the hash without the leading '#' symbol.
   * @returns {string} The current URL path.
   */
  _getCurrentUrl() {
    return window.location.hash.slice(1).toLowerCase();
  },

  /**
   * Split the URL into resource and id segments.
   * @param {string} url - The URL to be split.
   * @returns {Object} An object containing resource and id.
   */
  _splitUrl(url) {
    const segments = url.split("/").filter(Boolean);
    return {
      resource: segments[0] || null,
      id: segments[1] || null,
    };
  },

  /**
   * Combine the resource and id into a full URL path.
   * @param {Object} urlSegments - The object containing resource and id.
   * @returns {string} The combined URL.
   */
  _combineUrl({ resource, id }) {
    if (!resource) return "/";
    return id ? `/${resource}/:id` : `/${resource}`;
  },
};

export default UrlParser;
