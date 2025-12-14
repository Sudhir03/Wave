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
import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "./api/users";

function App() {
  const { getToken } = useAuth();

  const {} = useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => {
      const token = await getToken();
      return getMyProfile({ token });
    },
    select: (res) => res.user,
  });

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
