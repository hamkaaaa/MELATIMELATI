import React from "react";
import { createBrowserRouter } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import UserDashboard from "./pages/UserDashboard";
import KasubbagDashboard from "./pages/KasubbagDashboard";
import SolverDashboard from "./pages/SolverDashboard";
import OperatorDashboard from "./pages/OperatorDashboard";
import Layout from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/dashboard",
    element: (
      <Layout>
        <UserDashboard />
      </Layout>
    ),
  },
  {
    path: "/dashboard/lapor",
    element: (
      <Layout>
        <UserDashboard />
      </Layout>
    ),
  },
  {
    path: "/dashboard/tiket",
    element: (
      <Layout>
        <UserDashboard />
      </Layout>
    ),
  },
  {
    path: "/kasubbag",
    element: (
      <Layout>
        <KasubbagDashboard />
      </Layout>
    ),
  },
  {
    path: "/solver",
    element: (
      <Layout>
        <SolverDashboard />
      </Layout>
    ),
  },
  {
    path: "/operator",
    element: (
      <Layout>
        <OperatorDashboard />
      </Layout>
    ),
  },
  {
    path: "/operator/tiket",
    element: (
      <Layout>
        <OperatorDashboard />
      </Layout>
    ),
  },
  {
    path: "/operator/analitik",
    element: (
      <Layout>
        <OperatorDashboard />
      </Layout>
    ),
  },
  {
    path: "*",
    element: <LoginPage />,
  }
]);
