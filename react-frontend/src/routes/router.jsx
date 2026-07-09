import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

import MainLayout from "../layouts/MainLayout.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";
import PageLoader from "../components/PageLoader.jsx";

// Lazy-loaded Pages
const Home = lazy(() => import("../pages/Home.jsx"));
const Login = lazy(() => import("../pages/Login.jsx"));
const Register = lazy(() => import("../pages/Register.jsx"));
const Watch = lazy(() => import("../pages/Watch.jsx"));
const Channel = lazy(() => import("../pages/Channel.jsx"));
const Profile = lazy(() => import("../pages/Profile.jsx"));
const UploadVideo = lazy(() => import("../pages/UploadVideo.jsx"));
const EditVideo = lazy(() => import("../pages/EditVideo.jsx"));
const CreateChannel = lazy(() => import("../pages/CreateChannel.jsx"));
const NotFound = lazy(() => import("../pages/NotFound.jsx"));

// A higher-order component that wraps a given component with Suspense for lazy loading
const withSuspense = (Component) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

// route paths definition
const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: withSuspense(Login),
      },
      {
        path: "/register",
        element: withSuspense(Register),
      },
    ],
  },

  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: withSuspense(Home),
      },
      {
        path: "/watch/:id",
        element: withSuspense(Watch),
      },
      {
        path: "/channel/:id",
        element: withSuspense(Channel),
      },
      {
        path: "/profile",
        element: withSuspense(Profile),
      },
      {
        path: "/create-channel",
        element: withSuspense(CreateChannel),
      },
      {
        path: "/upload",
        element: withSuspense(UploadVideo),
      },
      {
        path: "/edit-video/:id",
        element: withSuspense(EditVideo),
      },
    ],
  },

  {
    path: "*",
    element: withSuspense(NotFound),
  },
]);

export default router;