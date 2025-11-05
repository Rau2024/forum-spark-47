import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";

const titleSchema = z.string().trim().min(5, "Title must be at least 5 characters").max(200, "Title must be less than 200 characters");
const contentSchema = z.string().trim().min(20, "Content must be at least 20 characters").max(5000, "Content must be less than 5000 characters");

const CreatePost = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    setCategories(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      titleSchema.parse(title);
      contentSchema.parse(content);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("posts").insert({
      title: title.trim(),
      content: content.trim(),
      author_id: user.id,
      category_id: categoryId,
    });

    if (error) {
      toast.error("Error creating post");
    } else {
      toast.success("Post created successfully!");
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="What's on your mind?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Share your thoughts..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Post"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/")}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreatePost;
