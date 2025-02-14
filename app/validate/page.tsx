"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "../context/UserContext"; // Import context

export default function ValidatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { setUser } = useUser(); // Use context to set user data
  const BUBBLE_VALIDATE_URL = process.env.BUBBLE_VALIDATE_URL;

  useEffect(() => {
    if (!token) {
      router.replace("/restrict");
      return;
    }

    const validateToken = async () => {
      try {
        const response = await fetch(
          `${BUBBLE_VALIDATE_URL}?token=${token}`
        );
        const data = await response.json();
        console.log(response.ok, data?.status, data?.response?.decrypted);
        

        if(response.ok && data?.status === "success" && data?.response?.decrypted === "Unrecognized Token") {
          console.log("Unrecognized Token:", data.response.decrypted);
          router.replace("/restrict");
        }
        else {
          const userDataRes = data?.response?.decrypted;
          // User data: "{id: "1738736045530x772224990988892300", email: "earlrodson@gmail.com", chapter: "1738738252161x438288438159736800"}"
          console.log("User data:", userDataRes);

          try {
            setUser(userDataRes); // Save user data in context
            router.replace("/"); // Redirect to home
          } catch (error) {
            console.error("Failed to parse user data:", error);
            router.replace("/restrict");
          }
        }
      } catch (error) {
        console.error("Error validating token:", error);
        router.replace("/restrict");
      }
    };

    validateToken();
  }, [token, router, setUser, BUBBLE_VALIDATE_URL]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-semibold text-gray-800 animate-fadeIn animate-pulse">Validating...</h1>
    </div>
  );
}
