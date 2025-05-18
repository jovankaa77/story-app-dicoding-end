import Swal from "sweetalert2";
import StoryApi from "../../data/api";

export default class RegisterPagePresenter {
  constructor(view) {
    this.view = view;
    this.view.presenter = this;
  }

  // Handle form submission
  async handleSubmit(name, email, password) {
    if (!this._isValidForm(name, email, password)) {
      return this._showWarning("Please fill in all fields!");
    }

    try {
      const response = await this._registerUser(name, email, password);

      if (response.error) {
        throw new Error(response.message || "Unknown error");
      }

      this._showSuccess("Registration successful! Please login.");
      this._redirectToLogin();
    } catch (err) {
      this._showError("Registration Failed", err.message);
    }
  }

  // Validate the form fields
  _isValidForm(name, email, password) {
    return name && email && password;
  }

  // Register the user by calling the API
  async _registerUser(name, email, password) {
    return StoryApi.register({ name, email, password });
  }

  // Show success message
  _showSuccess(message) {
    return Swal.fire({
      icon: "success",
      title: "Success!",
      text: message,
      confirmButtonColor: "#60B5FF",
    });
  }

  // Show error message
  _showError(title, message) {
    return Swal.fire({
      icon: "error",
      title: title,
      text: message,
    });
  }

  // Show warning message
  _showWarning(message) {
    return Swal.fire({
      icon: "warning",
      title: "Oops!",
      text: message,
    });
  }

  // Redirect to the login page
  _redirectToLogin() {
    window.location.hash = "#/login";
  }
}
