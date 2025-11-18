import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Tag } from "lucide-react";

export default function WardrobeGrid({ items }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card 
          key={item.id}
          className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden"
        >
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            <img 
              src={item.image_url} 
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            {item.is_for_sale && !item.sold && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-500 text-white">
                  <ShoppingBag className="w-3 h-3 mr-1" />
                  ${item.price}
                </Badge>
              </div>
            )}
            {item.sold && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Badge variant="secondary">Sold</Badge>
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold truncate mb-1">{item.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Badge variant="outline" className="text-xs capitalize">
                {item.category}
              </Badge>
              {item.brand && (
                <span className="text-xs truncate">{item.brand}</span>
              )}
            </div>
            {item.color && (
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {item.color}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
