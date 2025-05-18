import "leaflet/dist/leaflet.css";
import L from "leaflet";
import AddStoryPresenter from "../add-story/add-story-presenter";

export default class AddStoryPage {
  constructor() {
    this._presenter = new AddStoryPresenter(this);
  }

  async render() {
    return `
      <style>
        /* Global Styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', sans-serif;
          background-color: #f7f7f7; /* Soft light background */
          color: #333; /* Main text color */
          line-height: 1.6;
        }

        /* Form Container */
        .container {
          display: flex;
          justify-content: center;
          flex-direction: column;
          padding: 20px;
          animation: fadeIn 1s ease-out; /* Smooth fade-in animation */
        }

        /* Form Wrapper Styling */
        .form-wrapper {
          background-color: #f0e6ff; /* Light purple background */
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 850px;
          text-align: center;
          animation: slideUp 0.8s ease-out; /* Slide-in effect for the form */
        }

        /* Title Styling */
        .form-wrapper h1 {
          font-size: 1.8rem;
          color: #6a4c9c; /* Purple header */
          margin-bottom: 1.5rem;
        }

        /* Form Group Styling */
        .form-group {
          margin-bottom: 2rem;
        }

        /* Label Styling */
        label {
          font-weight: 600;
          display: block;
          margin-bottom: 0.8rem;
          color: #6a4c9c; /* Purple labels */
        }

        /* Input/Textarea and Button Styling */
        textarea, input, button, select {
          width: 100%;
          padding: 1rem;
          font-size: 1.1rem;
          border-radius: 8px;
          border: 1px solid #ccc;
          outline: none;
        }

        /* Focused Input Styling */
        textarea:focus, input:focus {
          border-color: #9b59b6; /* Darker purple when focused */
        }

        /* Submit Button Styling */
        button {
          background-color: #9b59b6; /* Dark purple for button */
          color: white;
          border: none;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        button:hover {
          background-color: #8e44ad; /* Slightly darker purple on hover */
        }

        /* Photo Preview Styling */
        #photo-preview {
          margin-top: 1rem;
          position: relative;
        }

        .photo-preview-image {
          max-width: 100%;
          max-height: 250px;
          border-radius: 8px;
          object-fit: cover;
        }

        .remove-photo-button {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 28px;
          height: 28px;
          background-color: rgba(255, 0, 0, 0.8);
          color: white;
          border: none;
          border-radius: 50%;
          font-size: 1.2rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .remove-photo-button:hover {
          background-color: rgba(255, 0, 0, 1);
        }

        /* Map Styling */
        #map {
          height: 300px;
          border-radius: 8px;
        }

        /* Camera Modal Styling */
        .modal {
          display: none;
          position: fixed;
          z-index: 1000;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: auto;
          background-color: rgba(0, 0, 0, 0.6);
        }

        .modal-content {
          background-color: #FFFECB;
          margin: 5% auto;
          padding: 20px;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
        }

        .camera-container video {
          width: 100%;
          border-radius: 8px;
        }

        .camera-controls {
          display: flex;
          justify-content: space-between;
          margin-top: 1rem;
        }

        .camera-button {
          background-color: #9b59b6; /* Dark purple for camera buttons */
          color: white;
          padding: 0.6rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .camera-button:hover {
          background-color: #8e44ad; /* Darker purple when hovered */
        }

        /* Close Modal Button */
        .close-modal {
          position: absolute;
          top: 10px;
          right: 16px;
          font-size: 1.5rem;
          cursor: pointer;
        }

        /* Animation Keyframes */
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          0% {
            transform: translateY(30px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* Responsive Styles */
        @media screen and (max-width: 768px) {
          .container {
            padding: 1.5rem;
          }

          .form-wrapper {
            padding: 1.5rem;
          }

          .form-wrapper h1 {
            font-size: 1.6rem;
          }

          label {
            font-size: 1rem;
          }

          textarea, input, button, select {
            font-size: 1rem;
            padding: 0.9rem;
          }

          .photo-preview-image {
            max-height: 200px;
          }

          .modal-content {
            padding: 16px;
            margin: 10% auto;
          }

          .camera-controls {
            flex-direction: column;
            gap: 0.5rem;
          }

          .camera-button {
            width: 100%;
            padding: 0.8rem;
          }
        }
      </style>

      <section class="container">
      
        <div class="form-wrapper">
        <div class="form-group">
              <label for="map">Pilih lokasi</label>
              <div id="map"></div>
              <button type="button" id="get-location">Your location now</button>
            </div>

          <form id="story-form">
            <div class="form-group">
              <label for="description">Your story description</label>
              <textarea id="description" rows="3" required placeholder="Your description"></textarea>
            </div>

            <div class="form-group">
              <label for="photo">Your photo</label>
              <input type="file" id="photo" accept="image/*" />
              <button type="button" id="open-camera">Take live foto</button>
              <div id="photo-preview"></div>
            </div>

            
            <button type="submit">Submit now</button>
          </form>
        </div>

        <div id="camera-modal" class="modal">
          <div class="modal-content">
            <span class="close-modal">&times;</span>
            <div class="camera-container">
              <video id="camera-view" autoplay playsinline></video>
              <canvas id="camera-canvas" style="display:none;"></canvas>
              <div class="camera-controls">
                <button id="switch-camera" class="camera-button">Switch</button>
                <button id="capture-btn" class="camera-button">Take now</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // Methods that return references to the DOM elements
  getPhotoInputElement() {
    return document.getElementById("photo");
  }

  getOpenCameraButton() {
    return document.getElementById("open-camera");
  }

  getCloseModalButton() {
    return document.querySelector(".close-modal");
  }

  getSwitchCameraButton() {
    return document.getElementById("switch-camera");
  }

  getCaptureButton() {
    return document.getElementById("capture-btn");
  }

  getLocationButton() {
    return document.getElementById("get-location");
  }

  getFormElement() {
    return document.getElementById("story-form");
  }

  async afterRender() {
    await this._presenter.init();
  }

  destroy() {
    this._presenter.destroy();
  }
}
