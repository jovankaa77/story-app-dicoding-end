import LoginPage from "../pages/login/login-page";
import RegisterPage from "../pages/register/register-page";
import AboutPresenter from "../pages/about/about-presenter";
import AddStoryPage from "../pages/add-story/add-story-page";
import DetailStoryPage from "../pages/detail-story/detail-story-page";
import ProfilePage from "../pages/profile/profile-page";
import SavedStoriesPage from "../pages/detail-story/saved-story-page";
import HomePage from "../pages/home/home-page";

const routes = {
  "/register": RegisterPage,
  "/": HomePage,
  "/detail/:id": DetailStoryPage,
  "/about": AboutPresenter,
  "/profile": ProfilePage,
  "/saved": SavedStoriesPage,
  "/add-story": AddStoryPage,
  "/login": LoginPage,
};

export default routes;
