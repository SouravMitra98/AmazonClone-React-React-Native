import React from "react";
import { Text } from "react-native";

export default function RatingStars({ value = 0 }: { value?: number }) {
    const stars: string[] = [];
    for (let i = 0; i <= 5; i++) stars.push(i <= Math.round(value || 0) ? "★" : "☆");
    return <Text style={{ color: "#f5a623" }}>{stars.join(" ")}</Text>;
}