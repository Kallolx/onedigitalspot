import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/landing/Header";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      {/* Error SVG Illustration */}
      <img
        src="/assets/icons/error.svg"
        alt="404 Not Found"
        className="w-40 sm:w-56 md:w-72 lg:w-80 mb-6 drop-shadow-lg"
        onError={(e) => (e.currentTarget.style.display = "none")}
      />

      {/* Title & Message */}
      <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-foreground mb-2 tracking-tight">
        Oops! Page not found
      </h1>
      <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6">
        The page you’re looking for doesn’t exist or has been moved.
      </p>

      {/* Return Home Button */}
      <Button asChild>
        <Link to="/" className="font-medium text-sm sm:text-base">
          Return Home
        </Link>
      </Button>
    </div>
  );
};

export default NotFound;
