import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  SlidersHorizontal, 
  Loader2, 
  Heart,
  TrendingUp,
  Filter,
  Grid3x3,
  List,
  ArrowUpDown,
  Share2,
  ShoppingCart
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StyleMeModal from "../components/marketplace/StyleMeModal";

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState("all");
  const [condition, setCondition] = useState("all");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    fetchUser();
  }, []);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['marketplace-items'],
    queryFn: async () => {
      const allItems = await base44.entities.ClothingItem.list();
      return allItems.filter(item => item.is_for_sale && !item.sold);
    },
  });

  let filteredItems = items.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesCondition = condition === "all" || item.condition === condition;
    
    let matchesPrice = true;
    if (priceRange === "under50" && item.price >= 50) matchesPrice = false;
    if (priceRange === "50-100" && (item.price < 50 || item.price >= 100)) matchesPrice = false;
    if (priceRange === "over100" && item.price < 100) matchesPrice = false;
    
    return matchesSearch && matchesCategory && matchesCondition && matchesPrice;
  });

  // Sort items
  if (sortBy === "price-low") filteredItems.sort((a, b) => (a.price || 0) - (b.price || 0));
  if (sortBy === "price-high") filteredItems.sort((a, b) => (b.price || 0) - (a.price || 0));
  if (sortBy === "newest") filteredItems.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const handleStyleMe = (item) => {
    setSelectedItem(item);
    setShowStyleModal(true);
  };

  const categories = [
    { id: "all", name: "All Items", count: items.length },
    { id: "tops", name: "Tops", count: items.filter(i => i.category === "tops").length },
    { id: "bottoms", name: "Bottoms", count: items.filter(i => i.category === "bottoms").length },
    { id: "shoes", name: "Shoes", count: items.filter(i => i.category === "shoes").length },
    { id: "outerwear", name: "Outerwear", count: items.filter(i => i.category === "outerwear").length },
    { id: "accessories", name: "Accessories", count: items.filter(i => ["accessories", "bags", "jewelry"].includes(i.category)).length },
  ];

  const userMoods = user?.style_preferences || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar with Search */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search for brands, items, styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-11 border-gray-300 focus:border-gray-900 rounded-lg"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 h-11 border-gray-300">
                  <ArrowUpDown className="w-4 h-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setSortBy("newest")}>
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("price-low")}>
                  Price: Low to High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("price-high")}>
                  Price: High to Low
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("popular")}>
                  Most Popular
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 h-11 border-gray-300">
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2">
                  <p className="text-xs font-semibold text-gray-500 mb-2">PRICE RANGE</p>
                  <div className="space-y-1">
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setPriceRange("all")}>
                      All Prices
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setPriceRange("under50")}>
                      Under $50
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setPriceRange("50-100")}>
                      $50 - $100
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setPriceRange("over100")}>
                      Over $100
                    </Button>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <p className="text-xs font-semibold text-gray-500 mb-2">CONDITION</p>
                  <div className="space-y-1">
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setCondition("all")}>
                      All Conditions
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setCondition("new")}>
                      New
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setCondition("like-new")}>
                      Like New
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setCondition("good")}>
                      Good
                    </Button>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex gap-1 border border-gray-300 rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            <Button className="gap-2 h-11 bg-gray-900 hover:bg-gray-800 text-white">
              <ShoppingCart className="w-4 h-4" />
              Cart
            </Button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-gray-200 bg-white sticky top-[73px] z-30">
        <div className="max-w-[1600px] mx-auto px-6">
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="h-12 bg-transparent border-0 w-full justify-start gap-6">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="data-[state=active]:border-b-2 data-[state=active]:border-gray-900 rounded-none pb-3 px-0"
                >
                  <span className="font-semibold">{cat.name}</span>
                  <span className="ml-2 text-gray-400">({cat.count})</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Style Preferences Tags */}
      {userMoods.length > 0 && (
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="max-w-[1600px] mx-auto px-6 py-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-semibold text-gray-500 uppercase">Your Style:</span>
              <div className="flex gap-2 flex-wrap">
                {userMoods.map((mood) => (
                  <Badge key={mood} variant="secondary" className="capitalize bg-white border border-gray-300">
                    {mood}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Items Grid */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No items found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {filteredItems.map((item) => (
              <div key={item.id} className="group">
                <div className="relative aspect-[3/4] mb-3 overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 flex flex-col gap-2">
                    <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors">
                      <Heart className="w-4 h-4 text-gray-700" />
                    </button>
                    <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors">
                      <Share2 className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                  {item.condition === "new" && (
                    <Badge className="absolute top-2 left-2 bg-green-500 text-white border-0">
                      New
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {item.brand || item.category}
                  </p>
                  <h3 className="font-medium text-sm text-gray-900 line-clamp-2 leading-snug">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-lg font-bold text-gray-900">${item.price?.toFixed(2)}</p>
                    <Badge variant="outline" className="text-xs capitalize">{item.condition}</Badge>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white h-9 font-medium"
                    >
                      Buy Now
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white h-9 font-medium"
                      onClick={() => handleStyleMe(item)}
                    >
                      Style Me
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showStyleModal && selectedItem && (
        <StyleMeModal
          item={selectedItem}
          onClose={() => {
            setShowStyleModal(false);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
}