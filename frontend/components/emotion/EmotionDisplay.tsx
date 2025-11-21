"use client";

import React from "react";
import { EmotionData, EmotionType } from "@/lib/types/chat";
import { Smile, Frown, Angry, AlertTriangle, Zap, Minus } from "lucide-react";

interface EmotionDisplayProps {
  emotion: EmotionData;
  size?: "tiny" | "small" | "medium" | "large";
}

const emotionConfig: Record<
  EmotionType,
  { icon: React.ComponentType<{ className?: string }>; color: string; label: string }
> = {
  joy: { icon: Smile, color: "text-green-500", label: "Joy" },
  sadness: { icon: Frown, color: "text-blue-500", label: "Sadness" },
  anger: { icon: Angry, color: "text-red-500", label: "Anger" },
  fear: { icon: AlertTriangle, color: "text-purple-500", label: "Fear" },
  surprise: { icon: Zap, color: "text-yellow-500", label: "Surprise" },
  neutral: { icon: Minus, color: "text-gray-500", label: "Neutral" },
};

const sizeClasses = {
  tiny: "w-3 h-3",
  small: "w-4 h-4",
  medium: "w-6 h-6",
  large: "w-8 h-8",
};

export default function EmotionDisplay({ emotion, size = "medium" }: EmotionDisplayProps) {
  const config = emotionConfig[emotion.primary];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <Icon className={`${sizeClasses[size]} ${config.color}`} />
      {size !== "tiny" && (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-300">{config.label}</span>
          {size !== "small" && (
            <span className="text-xs text-gray-500">
              {(emotion.confidence * 100).toFixed(0)}% confident
            </span>
          )}
        </div>
      )}
    </div>
  );
}
