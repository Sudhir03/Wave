import React from "react";
import { Card as ShadCard } from "@/components/ui/card";

export const Card = ({ children, ...props }) => {
  return <ShadCard {...props}>{children}</ShadCard>;
};
