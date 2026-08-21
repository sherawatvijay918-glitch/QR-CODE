"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";

export default function QrCodeSvg({ value, size = 150 }: { value: string; size?: number }) {
  const [svgMarkup, setSvgMarkup] = useState<string>("");

  useEffect(() => {
    QRCode.toString(
      value,
      {
        type: "svg",
        margin: 1,
        width: size,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      },
      (err, string) => {
        if (err) {
          console.error("Failed to generate QR code:", err);
          return;
        }
        setSvgMarkup(string);
      }
    );
  }, [value, size]);

  if (!svgMarkup) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center text-xs text-muted font-mono"
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
      className="inline-block border border-zinc-100 rounded-xl overflow-hidden bg-white p-1"
    />
  );
}
