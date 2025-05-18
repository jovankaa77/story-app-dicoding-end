const Utils = {
  /**
   * Combines the active URL into a simplified format.
   * If URL has two parts, it combines the resource and id, else returns just the resource or the root.
   * @returns {string} The combined URL or root path.
   */
  parseActiveUrlWithCombiner() {
    const urlSplits = this._splitUrl(
      window.location.hash.slice(1).toLowerCase()
    );

    switch (urlSplits.length) {
      case 3:
        return `/${urlSplits[1]}/${urlSplits[2]}`;
      case 2:
        return `/${urlSplits[1]}`;
      default:
        return "/";
    }
  },

  /**
   * Returns an object containing the resource and id from the active URL.
   * @returns {Object} An object with resource and id or null if not found.
   */
  parseActiveUrlWithoutCombiner() {
    const urlSplits = this._splitUrl(
      window.location.hash.slice(1).toLowerCase()
    );
    return {
      resource: urlSplits[1] || null,
      id: urlSplits[2] || null,
    };
  },

  /**
   * Splits the URL into its components.
   * @param {string} url The URL to split.
   * @returns {Array} An array of URL components.
   * @private
   */
  _splitUrl(url) {
    return url.split("/").filter(Boolean); // Filters out empty segments from the URL.
  },

  /**
   * Shows or hides the global loader based on the loading state.
   * @param {boolean} isLoading True to show the loader, false to hide.
   */
  setLoading(isLoading) {
    const loader = document.getElementById("global-loader");
    if (loader) {
      loader.style.display = isLoading ? "block" : "none";
    }
  },
};

export default Utils;
