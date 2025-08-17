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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-primary/10 px-4">
      <div className="text-center max-w-md w-full">
        {/* Optional: Themed illustration */}
        <img
          src="/assets/404-pixel.svg"
          alt="404 Not Found"
          className="mx-auto mb-6 w-32 h-32 object-contain drop-shadow-lg"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
        <h1 className="text-6xl md:text-7xl font-pixel text-foreground mb-2 tracking-tighter">
          404
        </h1>
        <p className="text-lg md:text-xl font-pixel text-foreground mb-4">
          Page Not Found
        </p>
        <p className="text-base text-muted-foreground mb-8">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Button>
          <Link
            to="/"
            className="inline-block font-pixel bg-primary text-white px-6 py-2 rounded-lg shadow hover:bg-primary/90 transition-colors text-lg"
          >
            Return Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
