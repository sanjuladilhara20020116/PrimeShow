import React, { useState } from "react";
import { dummyTrailers } from "../assets/assets";
import BlurCircle from "./BlurCircle";

const TrailersSection = () => {
  const [currentTrailer, setCurrentTrailer] = useState(dummyTrailers[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleThumbnailClick = (trailer) => {
    setCurrentTrailer(trailer);
    setIsPlaying(false);
  };

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-visible">
      <p className="text-gray-300 font-medium text-lg max-w-[960px] mx-auto">
        Trailers
      </p>

      <div className="relative mt-6 w-full max-w-[960px] mx-auto">
        <BlurCircle center="-100px" left="-100px" />

        <div className="relative z-10">
          {!isPlaying && (
            <div
              className="relative cursor-pointer"
              onClick={() => setIsPlaying(true)}
            >
              <img
                src={currentTrailer.image}
                alt="Trailer Thumbnail"
                className="w-full h-[540px] object-cover rounded-lg"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-red-500 bg-opacity-80 rounded-full flex items-center justify-center text-white text-3xl">
                  ▶
                </div>
              </div>
            </div>
          )}

          {isPlaying && (
            <iframe
              key={currentTrailer.videoUrl}
              src={`${currentTrailer.videoUrl}?autoplay=1&rel=0`}
              title="Trailer Video"
              width="100%"
              height="540"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              className="rounded-lg"
            />
          )}
        </div>

        <div className="flex mt-4 gap-3 overflow-x-auto">
          {dummyTrailers.map((trailer, index) => (
            <img
              key={index}
              src={trailer.image}
              alt={`Trailer ${index + 1}`}
              className={`w-32 h-20 object-cover rounded-lg cursor-pointer border-2 ${
                currentTrailer.videoUrl === trailer.videoUrl
                  ? "border-red-500"
                  : "border-transparent"
              }`}
              onClick={() => handleThumbnailClick(trailer)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrailersSection;
