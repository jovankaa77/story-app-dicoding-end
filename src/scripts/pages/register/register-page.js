import StoryApi from "../../data/api";

export default class RegisterPage {
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
          background-color: #f4f4f4;
          color: #333;
          line-height: 1.6;
          animation: fadeIn 1s ease-in-out;
        }

        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          padding: 20px;
          animation: fadeIn 1s ease-in-out;
        }

        .form-box {
          background-color: #fff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
          text-align: center;
          animation: slideIn 0.6s forwards ease-out;
          animation-delay: 0.2s;
        }

        h1 {
          font-size: 2rem;
          color: #6a4c9c;
          margin-bottom: 20px;
          animation: fadeIn 1s forwards ease-in-out;
          animation-delay: 0.4s;
        }

        .form-group {
          margin-bottom: 20px;
          text-align: left;
        }

        label {
          font-size: 1rem;
          color: #333;
          margin-bottom: 8px;
          display: block;
        }

        input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          color: #333;
          outline: none;
          transition: border-color 0.3s ease;
          opacity: 0;
          animation: fadeIn 0.8s forwards ease-in-out;
          animation-delay: 0.6s;
        }

        input:focus {
          border-color: #6a4c9c;
        }

        button {
          background-color: #6a4c9c;
          color: #fff;
          border: none;
          padding: 12px 20px;
          font-size: 1.1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          width: 100%;
          opacity: 0;
          animation: fadeIn 1s forwards ease-in-out;
          animation-delay: 1s;
        }

        button:hover {
          background-color: #5a3e8a;
        }

        p {
          font-size: 1rem;
          margin-top: 20px;
        }

        a {
          color: #6a4c9c;
          text-decoration: none;
        }

        a:hover {
          text-decoration: underline;
        }

        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          0% {
            transform: translateY(30px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @media (max-width: 480px) {
          .form-box {
            width: 90%;
            padding: 20px;
          }

          h1 {
            font-size: 1.6rem;
          }

          button {
            font-size: 1rem;
          }
        }
      </style>

      <div class="container">
        <div class="form-box">
          <h1 tabindex="0">Register your account now</h1>
          <form id="register-form">
            <div class="form-group">
              <label for="name">Name</label>
              <input type="text" id="name" required />
            </div>
            <div class="form-group">
              <label for="email">Your email</label>
              <input type="email" id="email" required />
            </div>
            <div class="form-group">
              <label for="password">Your password</label>
              <input type="password" id="password" required />
            </div>
            <button type="submit">Register</button>
            <p>Have an account? <a href="#/login">Back to login</a></p>
          </form>
        </div>
      </div>
    `;
  }

  async afterRender() {
    const form = document.getElementById("register-form");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const password = form.password.value.trim();

      await this._handleRegistration(name, email, password);
    });
  }

  // Fungsi untuk menangani proses pendaftaran
  async _handleRegistration(name, email, password) {
    try {
      const response = await StoryApi.register({ name, email, password });

      if (response.error) throw new Error(response.message);

      alert("Registration successful! Please login.");
      window.location.hash = "#/login";
    } catch (err) {
      alert(`Registration failed: ${err.message}`);
    }
  }
}
