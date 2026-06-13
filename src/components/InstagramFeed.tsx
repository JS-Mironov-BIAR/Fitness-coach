"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

export default function InstagramFeed({ posts }: { posts: string[] }) {
  useEffect(() => {
    if (posts.length === 0) return;
    const process = () => window.instgrm?.Embeds?.process();
    if (window.instgrm) {
      process();
      return;
    }
    const id = "instagram-embed-script";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id;
      s.src = "https://www.instagram.com/embed.js";
      s.async = true;
      s.onload = process;
      document.body.appendChild(s);
    } else {
      process();
    }
  }, [posts]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((url) => (
        <blockquote
          key={url}
          className="instagram-media"
          data-instgrm-permalink={url}
          data-instgrm-version="14"
          style={{ width: "100%", minWidth: "auto", margin: 0 }}
        />
      ))}
    </div>
  );
}
