import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hash, FileText, Heart } from "lucide-react";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface FilterSidebarProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  selectedFilter: "all" | "my-posts" | "liked";
  onFilterSelect: (filter: "all" | "my-posts" | "liked") => void;
  isAuthenticated: boolean;
}

const FilterSidebar = ({
  categories,
  selectedCategory,
  onCategorySelect,
  selectedFilter,
  onFilterSelect,
  isAuthenticated,
}: FilterSidebarProps) => {
  return (
    <aside className="space-y-4">
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Hash className="h-4 w-4" />
          Categories
        </h3>
        <div className="space-y-2">
          <Button
            variant={selectedCategory === null ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => onCategorySelect(null)}
          >
            All Posts
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => onCategorySelect(category.id)}
            >
              <Badge
                className="mr-2 h-2 w-2 rounded-full p-0"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </Button>
          ))}
        </div>
      </Card>

      {isAuthenticated && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">My Activity</h3>
          <div className="space-y-2">
            <Button
              variant={selectedFilter === "my-posts" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => onFilterSelect("my-posts")}
            >
              <FileText className="mr-2 h-4 w-4" />
              My Posts
            </Button>
            <Button
              variant={selectedFilter === "liked" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => onFilterSelect("liked")}
            >
              <Heart className="mr-2 h-4 w-4" />
              Liked Posts
            </Button>
          </div>
        </Card>
      )}
    </aside>
  );
};

export default FilterSidebar;
