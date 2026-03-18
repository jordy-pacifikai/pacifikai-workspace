"use client";

import Image from "next/image";
import Link from "next/link";
import { Room, Lang } from "@/types";

interface RoomCardProps {
  room: Room;
  lang: Lang;
  t: {
    rooms: {
      capacity: string;
      persons: string;
      size: string;
      from: string;
      perNight: string;
      book: string;
    };
  };
  index: number;
}

export default function RoomCard({ room, lang, t, index }: RoomCardProps) {
  return (
    <div
      className="animate-on-scroll group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Image */}
      <div className="relative h-64 sm:h-72 overflow-hidden">
        <Image
          src={room.images[0]}
          alt={room.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <h3 className="font-serif text-2xl text-white font-bold">{room.name}</h3>
        </div>
        {room.featured && (
          <div className="absolute top-4 right-4 bg-sunset-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            {lang === "fr" ? "Populaire" : "Popular"}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
          {lang === "fr" ? room.descriptionFr : room.description}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 text-sunset-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {room.capacity} {t.rooms.persons}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 text-sunset-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            {room.size}
          </span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wider">{t.rooms.from}</span>
            <p className="text-sunset-500 font-serif text-xl font-bold">{room.priceLabel}</p>
          </div>
          <Link
            href={`/reservation?room=${room.id}`}
            className="bg-sunset-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-sunset-600 transition-colors"
          >
            {t.rooms.book}
          </Link>
        </div>
      </div>
    </div>
  );
}
