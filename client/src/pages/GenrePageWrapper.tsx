import React from "react";
import GenrePage from "./GenrePage";
import { genreData } from "@/data/genreData";
import { useRoute } from "wouter";

export default function GenrePageWrapper() {
  const matchInfo = useRoute("/genre/:genre/info");
  const matchMain = useRoute("/genre/:genre");

  const params = matchInfo[1] || matchMain[1];

  const genreKey = params?.genre as keyof typeof genreData;

  if (!genreKey || !genreData[genreKey]) {
    return <div className="p-12 text-center text-2xl">Genre not found</div>;
  }

  return <GenrePage genre={genreData[genreKey]} />;
}
