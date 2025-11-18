import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Loader2, Sparkles } from "lucide-react";

const CATEGORIES = ["tops", "bottoms", "dresses", "outerwear", "shoes", "accessories", "bags", "jewelry"];
const SEASONS = ["spring", "summer", "fall", "winter", "all-season"];
const CONDITIONS = ["new", "like-new", "good", "fair"];

export default function AddItemDialog({ open, onClose }) {
  const queryClient = useQueryClient();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    subcategory: "",
    color: "",
    brand: "",
    size: "",
    price: "",
    condition: "good",
    is_for_sale: false,
  });

  const createItemMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return await base44.entities.ClothingItem.create({
        ...data,
        owner_id: user.email,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['wardrobe-items']);
      onClose();
      resetForm();
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFile(file_url);
      
      // Extract data using AI
      setExtracting(true);
      const schema = await base44.entities.ClothingItem.schema();
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: schema,
      });

      if (result.status === "success" && result.output) {
        setFormData(prev => ({
          ...prev,
          ...result.output,
          image_url: file_url,
        }));
      } else {
        setFormData(prev => ({ ...prev, image_url: file_url }));
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
    setUploading(false);
    setExtracting(false);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.category || !uploadedFile) return;
    
    createItemMutation.mutate({
      ...formData,
      price: formData.price ? parseFloat(formData.price) : null,
      image_url: uploadedFile,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      subcategory: "",
      color: "",
      brand: "",
      size: "",
      price: "",
      condition: "good",
      is_for_sale: false,
    });
    setUploadedFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add New Item</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Upload */}
          <div>
            <Label>Item Photo</Label>
            <div className="mt-2">
              {uploadedFile ? (
                <div className="relative">
                  <img 
                    src={uploadedFile} 
                    alt="Uploaded item" 
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  {extracting && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                      <div className="text-white text-center">
                        <Sparkles className="w-8 h-8 animate-spin mx-auto mb-2" />
                        <p className="text-sm">AI is analyzing your item...</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  {uploading ? (
                    <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Blue Denim Jacket"
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat} className="capitalize">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                placeholder="e.g., Levi's"
              />
            </div>

            <div>
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => setFormData({...formData, color: e.target.value})}
                placeholder="e.g., Blue"
              />
            </div>

            <div>
              <Label htmlFor="size">Size</Label>
              <Input
                id="size"
                value={formData.size}
                onChange={(e) => setFormData({...formData, size: e.target.value})}
                placeholder="e.g., M"
              />
            </div>

            <div>
              <Label htmlFor="condition">Condition</Label>
              <Select value={formData.condition} onValueChange={(val) => setFormData({...formData, condition: val})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map(cond => (
                    <SelectItem key={cond} value={cond} className="capitalize">
                      {cond}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="for-sale"
              checked={formData.is_for_sale}
              onChange={(e) => setFormData({...formData, is_for_sale: e.target.checked})}
              className="w-4 h-4"
            />
            <Label htmlFor="for-sale" className="cursor-pointer">List this item for sale</Label>
          </div>

          {formData.is_for_sale && (
            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="0.00"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.category || !uploadedFile || createItemMutation.isPending}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {createItemMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add to Wardrobe'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}