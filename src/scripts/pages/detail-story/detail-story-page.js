import DetailStoryPresenter from "../detail-story/detail-story-presenter";

export default class DetailStoryPage {
  constructor() {
    this.presenter = new DetailStoryPresenter();
  }

  async render() {
    return `
    <section class="container">
        
        <h3>Location : </h3>
        <div class="story-wrapper">
        
          <div class="map-wrapper">
            <div id="map"></div>
          </div>
        </div>
        <br><br>
        <h3>Image : </h3>
        <div class="photo-wrapper" id="photo-section"></div>
        <div id="story-detail" class="story-meta">
          <p>Loading story...</p>
        </div>
      </section>
      <style>
        /* Global Styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f0f8ff; /* Light blue background */
          color: #333;
          line-height: 1.6;
        }

        /* Container Styling */
        .container {
          max-width: 960px;
          margin: 60px auto;
          padding: 2rem;
          background: linear-gradient(135deg, #e0c3fc 0%, #8e44ad 100%); /* Gradient Background */
          border-radius: 12px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
          animation: fadeIn 0.7s ease-in-out;
        }

        h1 {
          text-align: center;
          color: #ffffff; /* White text color */
          margin-bottom: 2rem;
          font-size: 2.5rem;
        }
        h3{
          color: #fff;
        }

        /* Flexbox for Layout */
        .story-wrapper {
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
        }

        /* Styling for Map and Photo Section */
        .map-wrapper, .photo-wrapper {
          flex: 1;
          min-width: 300px;
        }

        #map {
          height: 300px;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .photo-wrapper img {
          width: 100%;
          height: 300px;
          object-fit: cover;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        /* Story Meta Section Styling */
        .story-meta {
          margin-top: 1.5rem;
          background-color: #ffffff;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
        }

        .story-meta h2 {
          margin-bottom: 1rem;
          color: #6c5ce7; /* Lavender color */
        }

        .story-meta p {
          margin-bottom: 0.8rem;
          color: #444;
          line-height: 1.6;
        }

        .badge {
          display: inline-block;
          background:rgb(166, 159, 222);
          color: white;
          padding: 4px 10px;
          border-radius: 5px;
          font-size: 0.85rem;
          margin-right: 8px;
          font-weight: bold;
        }

        .btn {
          display: inline-block;
          margin-top: 1.5rem;
          padding: 10px 20px;
          background-color: #6c5ce7; /* Lavender color for the button */
          color: #fff;
          border: none;
          border-radius: 6px;
          text-decoration: none;
          font-weight: bold;
          transition: background-color 0.3s ease, transform 0.2s ease;
        }

        .btn:hover {
          background-color:rgb(139, 117, 176); /* Darker lavender on hover */
          transform: scale(1.03);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media screen and (max-width: 768px) {
          .story-wrapper {
            flex-direction: column;
          }
        }
      </style>

      
    `;
  }

  async afterRender() {
    this.presenter.handlePageLoad();
  }
}
