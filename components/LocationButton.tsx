import React from "react";
import WhiteBgShimmerButton from "./magicui/whiteBg-shimmer-button";
import { MapIcon } from "lucide-react";

interface LocationButtonProps {
  location: string;
}

const LocationButton: React.FC<LocationButtonProps> = ({ location }) => {
  const handleLocationClick = () => {
    if (location) {
      window.open(location, "_blank");
    } else {
      alert("Location information is not available for this collectible.");
    }
  };

  return (
    <WhiteBgShimmerButton
      borderRadius="6px"
      className="w-full mb-4 text-black flex  hover:bg-gray-200 h-[40px] rounded font-bold"
      onClick={handleLocationClick}
      disabled={!location}
    >
      <span className="mr-4"> View Location</span>
      <MapIcon />
    </WhiteBgShimmerButton>
  );
};

export default LocationButton;
