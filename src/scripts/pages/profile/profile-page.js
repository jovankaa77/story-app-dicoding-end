import Auth from "../../utils/auth";
import ProfilePresenter from "../profile/profile-presenter";

export default class ProfilePage {
  async render() {
    const user = Auth.getUser();
    const token = Auth.getToken();

    if (!token || !user) {
      window.location.hash = "#/login";
      return "<p>Redirecting to login...</p>";
    }

    return `
    <section class="container">
        <h1 tabindex="0">${user.name}</h1>
        <p><strong>Email:</strong> ${user.email}</p>
        <div class="notif-buttons">
          <button id="subscribe-button" class="notif-btn notification-button" title="Langganan Notifikasi" aria-label="Langganan">
            <i class="fas fa-bell"></i> Notif on
          </button>
          <button id="unsubscribe-button" class="notif-btn unsub notification-button" style="display:none;" title="Berhenti Langganan" aria-label="Berhenti Langganan">
            <i class="fas fa-bell-slash"></i> Berhenti Langganan
          </button>
        </div>
        <button id="logout-btn">Logout now</button>
      </section>

      <style>
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
          animation: fadeIn 1s ease-out;
        }

        .container {
          padding: 40px 20px;
          background-color: #6a4c9c;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          animation: slideIn 0.5s ease-out;
        }

        section {
          text-align: center;
          background-color: #6a4c9c;
          color: #fff;
          padding: 20px;
          border-radius: 12px;
          animation: fadeInSection 1s ease-out;
        }

        .avatar {
          border-radius: 50%;
          margin-bottom: 15px;
          border: 3px solid #fff;
          width: 120px;
          height: 120px;
          animation: fadeIn 1.5s ease-out;
        }

        h1 {
          font-size: 2rem;
          margin: 10px 0;
        }

        .badge {
          display: inline-block;
          background-color: #4CAF50;
          color: #fff;
          padding: 5px 15px;
          border-radius: 12px;
          margin-bottom: 20px;
          font-size: 1rem;
        }

        p {
          font-size: 1.1rem;
          margin-bottom: 15px;
        }

        .notif-buttons {
          margin-top: 20px;
        }

        .notif-btn {
          background-color: #4CAF50;
          color: #fff;
          width: 100%;
          border: none;
          padding: 10px 20px;
          font-size: 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          margin: 5px;
        }

        .notif-btn:hover {
          background-color: #45a049;
        }

        .notification-button {
          display: inline-block;
        }

        .unsub {
          background-color: #e57373;
        }

        .unsub:hover {
          background-color: #f44336;
        }

        #logout-btn {
          background-color: #ff5722;
          color: #fff;
          border: none;
          padding: 10px 20px;
          font-size: 1rem;
          width: 100%;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 20px;
          transition: background-color 0.3s ease;
        }

        #logout-btn:hover {
          background-color: #e64a19;
        }

        /* Animations */
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        @keyframes slideIn {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        @keyframes fadeInSection {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

      </style>

      
    `;
  }

  async afterRender() {
    ProfilePresenter.init();
  }
}
