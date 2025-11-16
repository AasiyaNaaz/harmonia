import Navigation from "@/components/Navigation";
import HomePage from "@/components/HomePage";
import { useAppContext } from "@/hooks/useAppContext";

export default function Home() {
  const { darkMode, setDarkMode } = useAppContext();

  return (
    <>
      <Navigation />
      <HomePage darkMode={darkMode} setDarkMode={setDarkMode} />
    </>
  );
}
