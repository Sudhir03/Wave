import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  useAuth,
} from "@clerk/clerk-react";
import AppRoutes from "@/routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";

function App() {
  const { getToken } = useAuth();

  useEffect(() => {
    const showToken = async () => {
      const token = await getToken({ template: "backend-api" });
      console.log("JWT Token:", token);
    };
    showToken();
  }, [getToken]);

  return (
    <>
      <SignedIn>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={2500} limit={1} />
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

export default App;
