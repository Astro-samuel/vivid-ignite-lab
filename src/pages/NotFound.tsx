import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Mascot from "@/components/Mascot";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6 page-dots">
      <div className="text-center flex flex-col items-center">
        <Mascot size={140} />
        <h1 className="mt-4 text-4xl font-black text-foreground">Page not found</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-[36ch]">
          We couldn't find <code className="font-mono text-base">{location.pathname}</code>. It may have moved, or the link is wrong.
        </p>
        <Link to="/" className="clay-btn clay-btn-primary clay-btn-lg mt-8">
          Back to home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;