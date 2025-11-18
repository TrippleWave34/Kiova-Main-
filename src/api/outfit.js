// src/api/outfits.js
import { base44Fetch } from "./base44Client";

// GET all outfits
export async function fetchOutfitEntities() {
  return await base44Fetch("entities/Outfit");
}

// UPDATE outfit
export async function updateOutfitEntity(entityId, updateData) {
  return await base44Fetch(`entities/Outfit/${entityId}`, {
    method: "PUT",
    body: JSON.stringify(updateData),
  });
}
