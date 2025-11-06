import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "../components/LoginPage";
import MessagePage from "../components/MessagePage";


export const router = (user: any) =>
  createBrowserRouter([
    {
      children: [
        {
          path: "auth/login",
          Component: LoginPage,
        },
        {
          path: "messages",
          Component: () => {
            if (!user) return <Navigate to="/auth/login" />;
            return <MessagePage />;
          },
        },
        {
          path: "*",
          Component: () => <Navigate to="/messages" />,
        },
      ],
    },
  ]);
