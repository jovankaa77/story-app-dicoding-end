export default class AboutPage {
  async render() {
    return `

    <section class="container about-container">
        <h1 class="about-header">About Our Sharing App</h1>
        <p class="view-transition-fade">
          <strong>Story Life Sharing App Dicoding Powered By DBS</strong> sharing story with live camera
        </p>

        <div class="about-cards">
          <div class="about-card view-transition-card">
            <i data-feather="camera"></i>
            <h3>Sharing Capture Camera Live</h3>
            <p>Use your device's camera to add visual elements to your stories.</p>
          </div>

          <div class="about-card view-transition-card">
            <i data-feather="map-pin"></i>
            <h3>Live Locations</h3>
            <p>Add your unique locations and view them on the interactive map with automatic markers.</p>
          </div>

          <div class="about-card view-transition-card">
            <i data-feather="smartphone"></i>
            <h3>All devices</h3>
            <p>Designed with a responsive layout that looks great on all screen sizes.</p>
          </div>
        </div>

        <p style="margin-top: 2rem;" class="view-transition-fade">Create by <strong>jopan</strong>.</p>
      </section>
      <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
            background-color: #f7f7f7;
          }

          .container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }

          .about-container {
            text-align: center;
            padding: 40px 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }

          .about-header {
            font-size: 2.5rem;
            color: #333;
            margin-bottom: 20px;
          }

          .view-transition-fade {
            opacity: 0;
            animation: fadeIn 1s forwards;
          }

          @keyframes fadeIn {
            to {
              opacity: 1;
            }
          }

          .about-cards {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            margin-top: 30px;
          }

          .about-card {
            background-color: #f9f9f9;
            border-radius: 10px;
            padding: 20px;
            flex: 1;
            text-align: center;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }

          .about-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
          }

          .about-card i {
            font-size: 3rem;
            color: #4CAF50;
            margin-bottom: 10px;
          }

          .about-card h3 {
            font-size: 1.5rem;
            color: #333;
            margin-bottom: 10px;
          }

          .about-card p {
            font-size: 1rem;
            color: #666;
          }

          .view-transition-card {
            opacity: 0;
            animation: fadeInCard 1s forwards;
            animation-delay: 0.2s;
          }

          @keyframes fadeInCard {
            to {
              opacity: 1;
            }
          }

          p {
            font-size: 1.2rem;
            color: #333;
            margin-top: 20px;
          }

      </style>

     
    `;
  }

  async afterRender() {
    if (window.feather) {
      feather.replace();
    }

    if ("startViewTransition" in document) {
      this.setupViewTransitions();
    }
  }

  setupViewTransitions() {
    const cards = document.querySelectorAll(".about-card");
    cards.forEach((card, index) => {
      card.style.viewTransitionName = `card-${index}`;
      card.style.animationDelay = `${index * 0.8}s`;
    });

    const header = document.querySelector(".about-header");
    if (header) {
      header.style.viewTransitionName = "about-header";
    }

    const container = document.querySelector(".about-container");
    if (container) {
      container.style.viewTransitionName = "about-main";
    }
  }
}
