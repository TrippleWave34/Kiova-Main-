import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, X, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function UploadWardrobe() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);

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
    },
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    
    for (const file of files) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        
        // Extract data using AI
        const schema = await base44.entities.ClothingItem.schema();
        const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
          file_url,
          json_schema: schema,
        });

        const itemData = result.status === "success" && result.output 
          ? { ...result.output, image_url: file_url }
          : { name: "Clothing Item", category: "tops", image_url: file_url };

        setUploadedFiles(prev => [...prev, { ...itemData, id: Date.now() + Math.random() }]);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
    
    setUploading(false);
  };

  const removeFile = (id) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleFinish = async () => {
    if (uploadedFiles.length === 0) return;

    setProcessing(true);
    
    try {
      for (const item of uploadedFiles) {
        const { id, ...itemData } = item;
        await createItemMutation.mutateAsync(itemData);
      }
      
      await base44.auth.updateMe({
        onboarding_completed: true
      });

      navigate(createPageUrl("Marketplace"));
    } catch (error) {
      console.error("Error saving items:", error);
    }
    
    setProcessing(false);
  };

  const handleSkip = async () => {
    await base44.auth.updateMe({
      onboarding_completed: true
    });
    navigate(createPageUrl("Marketplace"));
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Upload Your Wardrobe
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Add photos of your clothes to create a digital wardrobe
          </p>
          <p className="text-sm text-gray-500">
            Our AI will automatically tag and categorize each item
          </p>
        </div>

        {/* Upload Area */}
        <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors mb-8">
          <label className="flex flex-col items-center justify-center p-12 cursor-pointer">
            {uploading ? (
              <>
                <Loader2 className="w-16 h-16 text-gray-400 animate-spin mb-4" />
                <p className="text-gray-600">Processing images...</p>
              </>
            ) : (
              <>
                <Upload className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop photos here or click to upload
                </p>
                <p className="text-sm text-gray-500">
                  Upload multiple items at once (PNG, JPG, up to 10MB each)
                </p>
              </>
            )}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </Card>

        {/* Uploaded Items Grid */}
        {uploadedFiles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Uploaded Items ({uploadedFiles.length})
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {uploadedFiles.map((item) => (
                <div key={item.id} className="relative group">
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => removeFile(item.id)}
                    className="absolute top-2 right-2 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-gray-600 mt-2 truncate capitalize">
                    {item.category || 'Item'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={handleSkip}
            size="lg"
            className="px-8"
          >
            Skip for now
          </Button>
          <Button
            onClick={handleFinish}
            disabled={uploadedFiles.length === 0 || processing}
            size="lg"
            className="bg-gray-900 hover:bg-gray-800 text-white px-12"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              `Continue with ${uploadedFiles.length} items`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}