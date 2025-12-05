import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  useAuth,
} from "@clerk/clerk-react";
import AppRoutes from "@/routes/AppRoutes";
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
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

export default App;
