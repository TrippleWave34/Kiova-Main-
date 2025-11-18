import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";

const MOODS = [
  { id: "minimalist", name: "Minimalist", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80" },
  { id: "streetwear", name: "Streetwear", image: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=400&q=80" },
  { id: "vintage", name: "Vintage", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80" },
  { id: "formal", name: "Formal", image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80" },
  { id: "bohemian", name: "Bohemian", image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80" },
  { id: "athletic", name: "Athletic", image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&q=80" },
  { id: "preppy", name: "Preppy", image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=400&q=80" },
  { id: "edgy", name: "Edgy", image: "https://images.unsplash.com/photo-1558769132-cb1aea3c819d?w=400&q=80" },
  { id: "romantic", name: "Romantic", image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80" },
  { id: "casual", name: "Casual", image: "https://images.unsplash.com/photo-1525457136159-8878648a7ad0?w=400&q=80" },
  { id: "business", name: "Business", image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&q=80" },
  { id: "grunge", name: "Grunge", image: "https://images.unsplash.com/photo-1509319117992-d6e2f1b6f10b?w=400&q=80" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [processing, setProcessing] = useState(false);

  const toggleMood = (moodId) => {
    setSelectedMoods(prev => 
      prev.includes(moodId)
        ? prev.filter(id => id !== moodId)
        : [...prev, moodId]
    );
  };

  const handleContinue = async () => {
    if (selectedMoods.length < 5) return;
    
    setProcessing(true);
    
    try {
      await base44.auth.updateMe({
        style_preferences: selectedMoods,
      });
      
      navigate(createPageUrl("UploadWardrobe"));
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
    setProcessing(false);
  };

  if (processing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Personalizing your experience...</h2>
          <p className="text-gray-600">AI is analyzing your style preferences</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Select Your Style Moods
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Choose at least 5 styles that represent your fashion aesthetic
          </p>
          <div className="inline-flex items-center gap-4 bg-gray-100 px-6 py-3 rounded-full">
            <span className={`text-sm font-semibold ${selectedMoods.length >= 5 ? 'text-green-600' : 'text-gray-600'}`}>
              {selectedMoods.length} / 5 selected
            </span>
            <div className="h-2 w-40 bg-gray-300 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gray-900 transition-all duration-300"
                style={{ width: `${Math.min((selectedMoods.length / 5) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Mood Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {MOODS.map((mood) => (
            <div
              key={mood.id}
              className={`cursor-pointer transition-all duration-200 overflow-hidden rounded-2xl group relative ${
                selectedMoods.includes(mood.id)
                  ? 'ring-4 ring-gray-900 shadow-2xl scale-105'
                  : 'shadow-md hover:shadow-xl hover:scale-105'
              }`}
              onClick={() => toggleMood(mood.id)}
            >
              <div className="relative aspect-[3/4]">
                <img 
                  src={mood.image} 
                  alt={mood.name}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity ${
                  selectedMoods.includes(mood.id) ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'
                }`}></div>
                
                {selectedMoods.includes(mood.id) && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-5 h-5 text-gray-900" />
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-white font-bold text-lg">{mood.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleContinue}
            disabled={selectedMoods.length < 5}
            size="lg"
            className={`px-16 py-7 text-lg rounded-xl shadow-lg transition-all ${
              selectedMoods.length >= 5 
                ? 'bg-gray-900 hover:bg-gray-800 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {selectedMoods.length < 5 
              ? `Select ${5 - selectedMoods.length} more` 
              : 'Continue to Upload Wardrobe'
            }
          </Button>
        </div>
      </div>
    </div>
  );
}