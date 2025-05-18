import Auth from "../../utils/auth";
import LoginPresenter from "../login/login-presenter.js";

export default class LoginPage {
  async render() {
    const token = Auth.getToken();
    const userInfo = Auth.getUser();

    if (token && userInfo) {
      window.location.hash = "#/profile";
      return "";
    }

    return `
    <div class="container">
        <div class="form-box">
          <h1 tabindex="0">Login now</h1>
          <form id="login-form">
            <div class="form-group">
              <label for="email">Your email</label>
              <input type="email" id="email" required />
            </div>
            <div class="form-group">
              <label for="password">Your password</label>
              <input type="password" id="password" required />
            </div>
            <button type="submit" class="btn">Login</button>
            <p>Havent an account? <a href="#/register">Daftar sekarang</a></p>
          </form>
        </div>
      </div>
      <style>
        /* Global Styles */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Inter', sans-serif;
            background-color: #f4f4f4; /* Warna abu-abu terang */
            color: #333; /* Warna teks utama */
            line-height: 1.6;
          }

          /* Container for the form */
          .container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            padding: 20px;
            animation: fadeIn 1s ease-in-out; /* Animasi fadeIn saat kontainer muncul */
          }

          /* Form Box Styles */
          .form-box {
            background-color: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
            text-align: center;
            opacity: 0; /* Mulai dengan opacity 0 untuk animasi */
            transform: translateY(30px); /* Mulai dari posisi lebih rendah */
            animation: slideIn 0.6s forwards ease-out; /* Animasi slideIn untuk form box */
            animation-delay: 0.2s; /* Menunda animasi untuk efek yang lebih smooth */
          }

          /* Heading */
          h1 {
            font-size: 2rem;
            color: #6a4c9c; /* Warna ungu modern */
            margin-bottom: 20px;
            opacity: 0;
            animation: fadeIn 1s forwards ease-in-out; /* Animasi fadeIn pada judul */
            animation-delay: 0.4s; /* Menunda animasi judul */
          }

          /* Form Group Styles */
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
            animation: fadeIn 0.8s forwards ease-in-out; /* Animasi input muncul */
          }

          input:focus {
            border-color: #6a4c9c; /* Warna ungu ketika fokus */
          }

          /* Submit Button Styles */
          button {
            background-color: #6a4c9c; /* Warna ungu */
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
            animation-delay: 0.6s; /* Menunda animasi tombol */
          }

          button:hover {
            background-color: #5a3e8a; /* Warna ungu lebih gelap ketika hover */
          }

          /* Link Styles */
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

          /* Animations */
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

          /* Responsive Styles */
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

      
    `;
  }

  async afterRender() {
    const form = document.getElementById("login-form");
    LoginPresenter.init({ formElement: form });
  }
}
