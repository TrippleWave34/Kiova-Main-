import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { X, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function StyleMeModal({ item, onClose }) {
  const [user, setUser] = useState(null);
  const [selectedItems, setSelectedItems] = useState({
    tops: null,
    bottoms: null,
    outerwear: null,
    shoes: null,
    accessories: [],
  });

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    fetchUser();
  }, []);

  const { data: wardrobeItems = [], isLoading } = useQuery({
    queryKey: ['wardrobe-items', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.ClothingItem.filter({ owner_id: user.email });
    },
    enabled: !!user,
  });

  const { data: recommendations = [], isLoading: loadingRecs } = useQuery({
    queryKey: ['recommendations', item.id],
    queryFn: async () => {
      const allItems = await base44.entities.ClothingItem.list();
      return allItems
        .filter(i => i.is_for_sale && !i.sold && i.id !== item.id)
        .slice(0, 8);
    },
  });

  const groupedWardrobe = {
    tops: wardrobeItems.filter(i => i.category === 'tops'),
    bottoms: wardrobeItems.filter(i => i.category === 'bottoms'),
    outerwear: wardrobeItems.filter(i => i.category === 'outerwear'),
    shoes: wardrobeItems.filter(i => i.category === 'shoes'),
    accessories: wardrobeItems.filter(i => ['accessories', 'bags', 'jewelry'].includes(i.category)),
  };

  const groupedRecommendations = {
    tops: recommendations.filter(i => i.category === 'tops'),
    bottoms: recommendations.filter(i => i.category === 'bottoms'),
    outerwear: recommendations.filter(i => i.category === 'outerwear'),
    shoes: recommendations.filter(i => i.category === 'shoes'),
  };

  const handleItemSelect = (category, selectedItem) => {
    if (category === 'accessories') {
      setSelectedItems(prev => {
        const accessories = prev.accessories || [];
        const isSelected = accessories.some(i => i.id === selectedItem.id);
        return {
          ...prev,
          accessories: isSelected 
            ? accessories.filter(i => i.id !== selectedItem.id)
            : [...accessories, selectedItem].slice(0, 2)
        };
      });
    } else {
      setSelectedItems(prev => ({
        ...prev,
        [category]: prev[category]?.id === selectedItem.id ? null : selectedItem
      }));
    }
  };

  // Auto-assign marketplace item
  useEffect(() => {
    if (item) {
      const category = ['tops', 'bottoms', 'outerwear', 'shoes'].includes(item.category) 
        ? item.category 
        : 'tops';
      
      setSelectedItems(prev => ({
        ...prev,
        [category]: item
      }));
    }
  }, [item]);

  const allSelected = [
    selectedItems.tops,
    selectedItems.bottoms,
    selectedItems.outerwear,
    selectedItems.shoes,
    ...(selectedItems.accessories || [])
  ].filter(Boolean);

  const totalPrice = allSelected.reduce((sum, i) => sum + (i.price || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[1400px] h-[90vh] bg-white rounded-3xl overflow-hidden flex shadow-2xl">
        {/* Left - AI Recommendations */}
        <div className="w-64 border-r flex flex-col" style={{ borderColor: 'var(--meteor-gray)', backgroundColor: '#FAFAFA' }}>
          <div className="p-4 border-b" style={{ borderColor: 'var(--meteor-gray)' }}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: 'var(--solar-orange)' }} />
              <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--eclipse-charcoal)' }}>
                AI Picks
              </h3>
            </div>
          </div>
          <ScrollArea className="flex-1 p-3">
            {loadingRecs ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto mt-8" style={{ color: 'var(--solar-orange)' }} />
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedRecommendations).map(([cat, items]) => (
                  items.length > 0 && (
                    <div key={cat}>
                      <h4 className="text-xs font-semibold mb-2 capitalize" style={{ color: 'var(--meteor-gray)' }}>{cat}</h4>
                      <div className="space-y-2">
                        {items.slice(0, 2).map((recItem) => (
                          <div
                            key={recItem.id}
                            className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                              selectedItems[cat]?.id === recItem.id ? 'ring-2' : ''
                            }`}
                            style={{
                              borderColor: selectedItems[cat]?.id === recItem.id ? 'var(--solar-orange)' : 'var(--meteor-gray)',
                              ringColor: 'var(--solar-orange)'
                            }}
                            onClick={() => handleItemSelect(cat, recItem)}
                          >
                            <img src={recItem.image_url} alt={recItem.name} className="w-full aspect-square object-cover" />
                            <div className="p-2 bg-white">
                              <p className="text-xs truncate font-medium" style={{ color: 'var(--eclipse-charcoal)' }}>
                                {recItem.name}
                              </p>
                              <p className="text-sm font-bold" style={{ color: 'var(--solar-orange)' }}>${recItem.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Center - Outfit Display */}
        <div className="flex-1 flex flex-col">
          <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--meteor-gray)' }}>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--eclipse-charcoal)' }}>Your Styled Look</h2>
              <p className="text-sm" style={{ color: 'var(--meteor-gray)' }}>Mix. Match. Shop.</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
            >
              <X className="w-5 h-5" style={{ color: 'var(--eclipse-charcoal)' }} />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-8">
            {allSelected.length > 0 ? (
              <div className="max-w-2xl mx-auto grid grid-cols-2 gap-6">
                {/* Top/Outerwear */}
                {selectedItems.outerwear && (
                  <div className="col-span-2">
                    <div className="aspect-[2/1] rounded-2xl overflow-hidden shadow-lg">
                      <img src={selectedItems.outerwear.image_url} alt={selectedItems.outerwear.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm mt-2 text-center font-medium" style={{ color: 'var(--eclipse-charcoal)' }}>
                      {selectedItems.outerwear.name}
                    </p>
                  </div>
                )}
                
                {selectedItems.tops && (
                  <div className={selectedItems.outerwear ? 'col-span-1' : 'col-span-2'}>
                    <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
                      <img src={selectedItems.tops.image_url} alt={selectedItems.tops.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm mt-2 text-center font-medium" style={{ color: 'var(--eclipse-charcoal)' }}>
                      {selectedItems.tops.name}
                    </p>
                  </div>
                )}

                {selectedItems.bottoms && (
                  <div className="col-span-2">
                    <div className="aspect-[2/1] rounded-2xl overflow-hidden shadow-lg">
                      <img src={selectedItems.bottoms.image_url} alt={selectedItems.bottoms.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm mt-2 text-center font-medium" style={{ color: 'var(--eclipse-charcoal)' }}>
                      {selectedItems.bottoms.name}
                    </p>
                  </div>
                )}

                {selectedItems.shoes && (
                  <div>
                    <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
                      <img src={selectedItems.shoes.image_url} alt={selectedItems.shoes.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm mt-2 text-center font-medium" style={{ color: 'var(--eclipse-charcoal)' }}>
                      {selectedItems.shoes.name}
                    </p>
                  </div>
                )}

                {selectedItems.accessories?.map((acc, i) => (
                  <div key={acc.id}>
                    <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
                      <img src={acc.image_url} alt={acc.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm mt-2 text-center font-medium" style={{ color: 'var(--eclipse-charcoal)' }}>
                      {acc.name}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--meteor-gray)' }} />
                  <p style={{ color: 'var(--meteor-gray)' }}>Select items to create your look</p>
                </div>
              </div>
            )}
          </div>

          {allSelected.length > 0 && (
            <div className="p-6 border-t" style={{ borderColor: 'var(--meteor-gray)', backgroundColor: 'var(--eclipse-charcoal)' }}>
              <div className="max-w-2xl mx-auto flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70 mb-1">{allSelected.length} items</p>
                  <p className="text-3xl font-bold text-white">${totalPrice.toFixed(2)}</p>
                </div>
                <Button size="lg" className="px-8 text-white" style={{ backgroundColor: 'var(--solar-orange)' }}>
                  Buy Complete Look
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right - Your Wardrobe */}
        <div className="w-64 border-l flex flex-col" style={{ borderColor: 'var(--meteor-gray)', backgroundColor: '#FAFAFA' }}>
          <div className="p-4 border-b" style={{ borderColor: 'var(--meteor-gray)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--eclipse-charcoal)' }}>
              Your Wardrobe
            </h3>
          </div>
          <ScrollArea className="flex-1 p-3">
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto mt-8" style={{ color: 'var(--solar-orange)' }} />
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedWardrobe).map(([cat, items]) => (
                  items.length > 0 && (
                    <div key={cat}>
                      <h4 className="text-xs font-semibold mb-2 capitalize" style={{ color: 'var(--meteor-gray)' }}>{cat}</h4>
                      <div className="space-y-2">
                        {items.map((wItem) => {
                          const isSelected = cat === 'accessories'
                            ? selectedItems.accessories?.some(i => i.id === wItem.id)
                            : selectedItems[cat]?.id === wItem.id;
                          
                          return (
                            <div
                              key={wItem.id}
                              className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                                isSelected ? 'ring-2' : ''
                              }`}
                              style={{
                                borderColor: isSelected ? 'var(--atomic-cyan)' : 'var(--meteor-gray)',
                                ringColor: 'var(--atomic-cyan)'
                              }}
                              onClick={() => handleItemSelect(cat, wItem)}
                            >
                              <img src={wItem.image_url} alt={wItem.name} className="w-full aspect-square object-cover" />
                              <div className="p-2 bg-white">
                                <p className="text-xs truncate font-medium" style={{ color: 'var(--eclipse-charcoal)' }}>
                                  {wItem.name}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}