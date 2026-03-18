export interface Room {
  id: string;
  name: string;
  nameFr: string;
  slug: string;
  description: string;
  descriptionFr: string;
  capacity: number;
  price: number;
  priceLabel: string;
  size: string;
  bedType: string;
  bedTypeFr: string;
  amenities: string[];
  amenitiesFr: string[];
  images: string[];
  featured: boolean;
}

export interface ReservationData {
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  country: string;
  rating: number;
  text: string;
  textFr: string;
  avatar: string;
  date: string;
}

export interface Activity {
  id: string;
  name: string;
  nameFr: string;
  description: string;
  descriptionFr: string;
  image: string;
  duration: string;
}

export type Lang = "fr" | "en";
