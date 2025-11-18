import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Filter, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import AddItemDialog from "../components/wardrobe/AddItemDialog";
import WardrobeGrid from "../components/wardrobe/WardrobeGrid";

export default function Wardrobe() {
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    fetchUser();
  }, []);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['wardrobe-items', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.ClothingItem.filter({ owner_id: user.email });
    },
    enabled: !!user,
  });

  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ["all", "tops", "bottoms", "dresses", "outerwear", "shoes", "accessories", "bags", "jewelry"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Wardrobe</h1>
              <p className="text-gray-600">Manage your clothing collection</p>
            </div>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by name or brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
          <TabsList className="flex-wrap h-auto bg-white p-2 shadow-sm">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="capitalize data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{items.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">For Sale</p>
              <p className="text-2xl font-bold text-purple-600">
                {items.filter(item => item.is_for_sale && !item.sold).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Categories</p>
              <p className="text-2xl font-bold text-pink-600">
                {new Set(items.map(item => item.category)).size}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-amber-600">
                ${items.filter(item => item.is_for_sale).reduce((sum, item) => sum + (item.price || 0), 0).toFixed(0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Items Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No items yet</h3>
              <p className="text-gray-600 mb-6">Start building your digital wardrobe</p>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Add Your First Item
              </Button>
            </div>
          </Card>
        ) : (
          <WardrobeGrid items={filteredItems} />
        )}

        <AddItemDialog
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
        />
      </div>
    </div>
  );
}