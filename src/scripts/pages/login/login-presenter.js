import StoryApi from "../../data/api";
import Auth from "../../utils/auth";
import Swal from "sweetalert2";

const LoginPresenter = {
  init({ formElement }) {
    this._form = formElement;
    this._registerSubmitEvent();
  },

  // Register event listener for form submit
  _registerSubmitEvent() {
    if (this._form) {
      this._form.addEventListener("submit", this._handleFormSubmit.bind(this));
    }
  },

  // Handle the form submit event
  async _handleFormSubmit(e) {
    e.preventDefault();

    const email = this._form.email.value.trim();
    const password = this._form.password.value.trim();

    if (this._isFormValid(email, password)) {
      await this._loginUser(email, password);
    } else {
      this._showError("Please fill in all fields");
    }
  },

  // Validate form inputs
  _isFormValid(email, password) {
    return email && password;
  },

  // Perform login API request
  async _loginUser(email, password) {
    try {
      const response = await StoryApi.login({ email, password });

      if (response.error) {
        throw new Error(response.message);
      }

      this._saveUserData(response.loginResult, email);
      this._showSuccessMessage();
    } catch (err) {
      this._showError(err.message);
    }
  },

  // Save user data after successful login
  _saveUserData(loginResult, email) {
    Auth.saveToken(loginResult.token);
    Auth.saveUser({
      name: loginResult.name,
      email: email,
    });
  },

  // Display success message and redirect
  _showSuccessMessage() {
    Swal.fire({
      icon: "success",
      title: "Login Successful!",
      showConfirmButton: false,
      timer: 1500,
    }).then(() => {
      window.location.hash = "#/profile";
      window.location.reload();
    });
  },

  // Display error message using Swal
  _showError(message) {
    Swal.fire({
      icon: "error",
      title: "Login Failed",
      text: message,
    });
  },
};

export default LoginPresenter;
