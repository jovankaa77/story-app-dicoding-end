import StoryApi from "../../data/api";
import Auth from "../../utils/auth";
import Swal from "sweetalert2";
import L from "leaflet";
import { NotificationHelper } from "../../utils/notification-helper.js";

export default class AddStoryPresenter {
  constructor(view) {
    this._view = view;
    this._photoFile = null;
    this._map = null;
    this._marker = null;
    this._lat = null;
    this._lon = null;
    this._stream = null;
    this._usingRearCamera = false;
  }

  // Method to initialize map and set event listeners
  async init() {
    this._initializeMap();
    this._initializeEventListeners();
  }

  // Initialize the map
  _initializeMap() {
    this._map = L.map("map").setView([-2.5489, 118.0149], 5);
    const baseLayers = this._getBaseLayers();
    baseLayers["OpenStreetMap"].addTo(this._map);
    L.control.layers(baseLayers).addTo(this._map);
    this._map.on("click", this._handleMapClick.bind(this));
  }

  // Get base layers for the map
  _getBaseLayers() {
    return {
      OpenStreetMap: L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: "&copy; OpenStreetMap contributors" }
      ),
      "Esri WorldImagery": L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX" }
      ),
    };
  }

  // Handle map click event to set location
  _handleMapClick(e) {
    this._updateLocation(e.latlng.lat, e.latlng.lng);
  }

  // Update the location marker on the map
  _updateLocation(lat, lon) {
    this._lat = lat;
    this._lon = lon;
    if (this._marker) this._map.removeLayer(this._marker);
    this._marker = L.marker([lat, lon])
      .addTo(this._map)
      .bindPopup("Story location")
      .openPopup();
  }

  // Set up event listeners for user interactions
  _initializeEventListeners() {
    this._view
      .getPhotoInputElement()
      .addEventListener("change", this._handlePhotoChange.bind(this));
    this._view
      .getOpenCameraButton()
      .addEventListener("click", this._openCameraModal.bind(this));
    this._view
      .getCloseModalButton()
      .addEventListener("click", this._closeCameraModal.bind(this));
    this._view
      .getSwitchCameraButton()
      .addEventListener("click", this._toggleCamera.bind(this));
    this._view
      .getCaptureButton()
      .addEventListener("click", this._capturePhoto.bind(this));
    this._view
      .getLocationButton()
      .addEventListener("click", this._getLocation.bind(this));
    this._view
      .getFormElement()
      .addEventListener("submit", this._handleFormSubmit.bind(this));
  }

  // Handle the change in photo input (either from file selection or camera)
  _handlePhotoChange(e) {
    const file = e.target.files[0];
    if (file) {
      this._photoFile = file;
      this._showPhotoPreview(URL.createObjectURL(file));
    }
  }

  // Open the camera modal and initialize the camera stream
  _openCameraModal() {
    document.getElementById("camera-modal").style.display = "block";
    this._initCameraStream();
  }

  // Close the camera modal and stop the camera stream
  _closeCameraModal() {
    document.getElementById("camera-modal").style.display = "none";
    this._stopCameraStream();
  }

  // Initialize camera stream based on the selected camera (front or rear)
  async _initCameraStream() {
    try {
      if (this._stream) this._stopCameraStream();
      const constraints = {
        video: {
          facingMode: this._usingRearCamera ? "environment" : "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      };
      this._stream = await navigator.mediaDevices.getUserMedia(constraints);
      document.getElementById("camera-view").srcObject = this._stream;
    } catch (err) {
      console.error("Camera failed", err);
      alert("Camera failed");
    }
  }

  // Stop the camera stream when done
  _stopCameraStream() {
    if (this._stream) {
      this._stream.getTracks().forEach((track) => track.stop());
      document.getElementById("camera-view").srcObject = null;
      this._stream = null;
    }
  }

  // Toggle between front and rear camera
  _toggleCamera() {
    this._usingRearCamera = !this._usingRearCamera;
    this._initCameraStream();
  }

  // Capture photo from the camera
  _capturePhoto() {
    const video = document.getElementById("camera-view");
    const canvas = document.getElementById("camera-canvas");
    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        this._photoFile = new File([blob], "photo.jpg", { type: "image/jpeg" });
        this._showPhotoPreview(URL.createObjectURL(blob));
        this._closeCameraModal();
      },
      "image/jpeg",
      0.95
    );
  }

  // Show the photo preview after taking or selecting a photo
  _showPhotoPreview(url) {
    const previewContainer = document.getElementById("photo-preview");
    previewContainer.innerHTML = "";
    const img = document.createElement("img");
    img.src = url;
    img.alt = "Preview";
    img.className = "photo-preview-image";

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-photo-button";
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", () => {
      this._photoFile = null;
      previewContainer.innerHTML = "";
    });

    previewContainer.appendChild(img);
    previewContainer.appendChild(removeBtn);
  }

  // Get the current location using geolocation
  _getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this._updateLocation(pos.coords.latitude, pos.coords.longitude);
          this._map.setView([this._lat, this._lon], 15);
        },
        (err) => {
          console.error("Geolocation failed:", err);
          alert("Location failed");
        }
      );
    }
  }

  // Cleanup when the presenter is destroyed
  destroy() {
    this._stopCameraStream();
    if (this._map) {
      this._map.remove();
      this._map = null;
      this._marker = null;
    }
  }

  // Handle form submission (validate and send data)
  async _handleFormSubmit(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> submit..';

      const description = document.getElementById("description").value.trim();
      if (!description) throw new Error("Description is required.");
      if (!this._photoFile) throw new Error("Select ot take a foto");

      const formData = new FormData();
      formData.append("description", description);
      formData.append("photo", this._photoFile);
      if (this._lat && this._lon) {
        formData.append("lat", this._lat);
        formData.append("lon", this._lon);
      }

      const token = Auth.getToken();
      const response = token
        ? await StoryApi.addStory({ token, data: formData })
        : await StoryApi.addStoryGuest(formData);

      if (response.error) throw new Error(response.message || "Failed add");

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Story successfull!",
        timer: 2000,
        showConfirmButton: false,
      });

      NotificationHelper.sendPushNotification("Story successfull!", {
        body: "Thank you for sharing story",
      });

      window.location.hash = "#/";
    } catch (err) {
      console.error(err);
      Swal.fire("Oops!", err.message || "Error story", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit your story";
    }
  }
}
