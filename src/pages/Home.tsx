import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import FilterSidebar from "@/components/FilterSidebar";
import { toast } from "sonner";

const Home = () => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "my-posts" | "liked">("all");
  const [userLikes, setUserLikes] = useState<any[]>([]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts();
    if (user) {
      fetchUserLikes();
    }
  }, [selectedCategory, selectedFilter, user]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      toast.error("Error loading categories");
    } else {
      setCategories(data || []);
    }
  };

  const fetchPosts = async () => {
    let query = supabase
      .from("posts")
      .select(`
        *,
        profiles(username),
        categories(name, color),
        post_likes(is_like),
        comments(id)
      `)
      .order("created_at", { ascending: false });

    if (selectedCategory) {
      query = query.eq("category_id", selectedCategory);
    }

    if (selectedFilter === "my-posts" && user) {
      query = query.eq("author_id", user.id);
    } else if (selectedFilter === "liked" && user) {
      const { data: likedPosts } = await supabase
        .from("post_likes")
        .select("post_id")
        .eq("user_id", user.id)
        .eq("is_like", true);

      if (likedPosts && likedPosts.length > 0) {
        query = query.in("id", likedPosts.map((l) => l.post_id));
      } else {
        setPosts([]);
        return;
      }
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Error loading posts");
    } else {
      setPosts(data || []);
    }
  };

  const fetchUserLikes = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("post_likes")
      .select("*")
      .eq("user_id", user.id);

    setUserLikes(data || []);
  };

  const handleLike = async (postId: string, isLike: boolean) => {
    if (!user) {
      toast.error("Please login to like posts");
      return;
    }

    const existingLike = userLikes.find((like) => like.post_id === postId);

    if (existingLike) {
      if (existingLike.is_like === isLike) {
        // Remove like/dislike
        await supabase.from("post_likes").delete().eq("id", existingLike.id);
      } else {
        // Update like/dislike
        await supabase
          .from("post_likes")
          .update({ is_like: isLike })
          .eq("id", existingLike.id);
      }
    } else {
      // Add new like/dislike
      await supabase.from("post_likes").insert({
        post_id: postId,
        user_id: user.id,
        is_like: isLike,
      });
    }

    fetchPosts();
    fetchUserLikes();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <FilterSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={(id) => {
                setSelectedCategory(id);
                setSelectedFilter("all");
              }}
              selectedFilter={selectedFilter}
              onFilterSelect={(filter) => {
                setSelectedFilter(filter);
                setSelectedCategory(null);
              }}
              isAuthenticated={!!user}
            />
          </div>

          <div className="lg:col-span-3 space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts found. Be the first to create one!</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={user ? handleLike : undefined}
                  userLike={userLikes.find((like) => like.post_id === post.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
