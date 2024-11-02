import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "react-hot-toast";

import AppLayout from "./Components/AppLayout";
import ProtectedRoute from "./Components/ProtectedRoute";

import SignInPage from "./Pages/SignInPage";
import Fallback from "./Components/Fallback";

const Search = lazy(() => import("./Pages/Search"));
const ProfilePage = lazy(() => import("./Pages/ProfilePage"));
const ExplorePage = lazy(() => import("./Pages/ExplorePage"));
const UserPage = lazy(() => import("./Pages/UserPage"));
const UserPost = lazy(() => import("./Pages/UserPost"));

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 0 } },
});

function App() {
  return (
    <Suspense fallback={<Fallback />}>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SignInPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="profile" element={<ProfilePage />} />
              <Route path="explore" element={<ExplorePage />} />
              <Route path="search" element={<Search />} />
              <Route path="/:userId" element={<UserPage />} />
              <Route path="post/:postId" element={<UserPost />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster
          toastOptions={{
            success: {
              duration: 1 * 1000,
              style: {
                background: "#abf7b1",
              },
            },
            error: {
              duration: 10 * 1000,
              style: {
                background: "#ff6865",
              },
            },
          }}
        />
      </QueryClientProvider>
    </Suspense>
  );
}

export default App;
