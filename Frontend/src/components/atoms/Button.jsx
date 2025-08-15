import React from "react";
import { Button as ShadButton } from "@/components/ui/button";

export const Button = ({ children, ...props }) => {
  return <ShadButton {...props}>{children}</ShadButton>;
};
