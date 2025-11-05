import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, LogOut, User, PlusCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface NavbarProps {
  user: any;
}

const Navbar = ({ user }: NavbarProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error logging out");
    } else {
      toast.success("Logged out successfully");
      navigate("/auth");
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Forum</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Button asChild variant="default" size="sm">
                <Link to="/create-post">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Post
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </Button>
              <Button onClick={handleLogout} variant="ghost" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Button asChild variant="default">
              <Link to="/auth">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
