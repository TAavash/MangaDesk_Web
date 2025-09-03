import React from "react";

interface BookCardProps {
  title: string;
  author: string;
}

export default function BookCard({ title, author }: BookCardProps) {
  return (
    <div className="p-4 border rounded">
      <h2>{title}</h2>
      <p>{author}</p>
    </div>
  );
}
