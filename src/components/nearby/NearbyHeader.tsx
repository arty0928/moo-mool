"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import HamburgerMenu from "../common/HamburgerMenu";

export default function NearbyHeader() {
  const router = useRouter();

  const handleClick = () => {
    router.back();
  };

  return (
    <div className="sticky top-0 z-50 flex h-12 items-center justify-center bg-white shadow-sm">
      <button className="absolute left-4" onClick={handleClick}>
        <ChevronLeft size={24} />
      </button>
      <span className="text-sm font-semibold">주변 친구 찾기</span>
      <div className="absolute right-4">
        <HamburgerMenu />
      </div>
    </div>
  );
}
