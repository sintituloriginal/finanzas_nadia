export type PropertyType = 'house' | 'apartment'
export type PropertyOperationType = 'rent' | 'buy'
export type PropertyStatus =
  | 'to_review'
  | 'interested'
  | 'contacted'
  | 'visit_scheduled'
  | 'visited'
  | 'discarded'

export interface SavedProperty {
  id: string
  user_id: string
  name: string
  property_type: PropertyType
  operation_type: PropertyOperationType | null
  price: number | null
  common_expenses: number | null
  address: string | null
  commune: string | null
  region: string | null
  bedrooms: number | null
  bathrooms: number | null
  surface_m2: number | null
  parking_spots: number | null
  image_url: string | null
  source_url: string | null
  description: string | null
  notes: string | null
  status: PropertyStatus
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export type VenueType =
  | 'event_center'
  | 'hall'
  | 'parcel'
  | 'hotel'
  | 'restaurant'
  | 'other'

export type VenuePriceType = 'total' | 'per_person' | 'other'

export type VenueStatus =
  | 'to_review'
  | 'interested'
  | 'quote_requested'
  | 'quoted'
  | 'visit_scheduled'
  | 'visited'
  | 'discarded'

export interface WeddingVenue {
  id: string
  user_id: string
  name: string
  venue_type: VenueType | null
  image_url: string | null
  address: string | null
  commune: string | null
  region: string | null
  price: number | null
  price_type: VenuePriceType
  capacity: number | null
  services: string | null
  source_url: string | null
  contact_phone: string | null
  target_date: string | null
  notes: string | null
  status: VenueStatus
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface WeddingVenueDocument {
  id: string
  user_id: string
  wedding_venue_id: string
  original_filename: string
  display_name: string | null
  storage_path: string
  mime_type: string
  file_size: number
  created_at: string
  updated_at: string
}
