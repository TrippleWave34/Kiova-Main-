import React, { useState, useEffect } from "react";
import { base44 } from "../api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import Button from "../components/Button";
import { ArrowRight, Sparkles, TrendingUp, Zap, Shield } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        // Check if user has completed mood selection
        if (!userData.style_preferences || userData.style_preferences.length === 0) {
          navigate(createPageUrl("Onboarding"));
          return;
        }
        
        // Check if user has completed onboarding (uploaded wardrobe)
        if (!userData.onboarding_completed) {
          navigate(createPageUrl("UploadWardrobe"));
          return;
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
      setLoading(false);
    };
    checkOnboarding();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-cyan-50 opacity-60"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-semibold text-orange-900">AI-Powered Styling</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Transform Your Style in Seconds
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Upload your wardrobe and let AI style you based on your mood, weather, and occasion. 
                Shop personalized pieces that perfectly match your existing collection.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button 
                  size="lg"
                  className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-6 text-lg rounded-xl shadow-lg"
                  onClick={() => navigate(createPageUrl("Marketplace"))}
                >
                  Explore Marketplace
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-gray-900 text-gray-900 hover:bg-gray-50 px-8 py-6 text-lg rounded-xl"
                  onClick={() => navigate(createPageUrl("Wardrobe"))}
                >
                  View My Wardrobe
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
                <div>
                  <p className="text-3xl font-bold text-gray-900">10K+</p>
                  <p className="text-sm text-gray-600">Active Users</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">50K+</p>
                  <p className="text-sm text-gray-600">Items Listed</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">98%</p>
                  <p className="text-sm text-gray-600">Satisfaction</p>
                </div>
              </div>
            </div>

            {/* Right Image Grid */}
            <div className="relative hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-xl">
                    <img 
                      src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80" 
                      alt="Fashion 1"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-xl">
                    <img 
                      src="https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=400&q=80" 
                      alt="Fashion 2"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-xl">
                    <img 
                      src="https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=400&q=80" 
                      alt="Fashion 3"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-xl">
                    <img 
                      src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80" 
                      alt="Fashion 4"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Kiova?</h2>
            <p className="text-xl text-gray-600">The future of fashion is here</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Matching</h3>
              <p className="text-gray-600 leading-relaxed">
                Our AI analyzes your style preferences and suggests pieces that perfectly complement your existing wardrobe.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Try Before You Buy</h3>
              <p className="text-gray-600 leading-relaxed">
                Visualize how new items will look with your clothes before making a purchase. No more regrets.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Style Suggestions</h3>
              <p className="text-gray-600 leading-relaxed">
                Get outfit recommendations in seconds based on weather, occasion, and your personal style.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to revolutionize your wardrobe?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join thousands of users who are styling smarter every day
          </p>
          <Button 
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-6 text-lg rounded-xl shadow-xl"
            onClick={() => navigate(createPageUrl("Marketplace"))}
          >
            Start Shopping Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}