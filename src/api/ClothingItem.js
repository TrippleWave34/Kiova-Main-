// src/api/clothing.js
import { base44Fetch } from "./base44Client";

// GET all clothing items
export async function fetchClothingItemEntities() {
  return await base44Fetch("entities/ClothingItem");
}

// UPDATE a clothing item
export async function updateClothingItemEntity(entityId, updateData) {
  return await base44Fetch(`entities/ClothingItem/${entityId}`, {
    method: "PUT",
    body: JSON.stringify(updateData),
  });
}
