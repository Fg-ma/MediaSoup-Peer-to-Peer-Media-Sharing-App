import React from "react";
import { Checkboard } from "react-color/lib/components/common";

interface CheckboardProps {
  size?: number;
  white?: string;
  grey?: string;
}

const CheckboardWrapper: React.FC<CheckboardProps> = ({
  size = 8,
  white = "#fff",
  grey = "#ccc",
}) => {
  return <Checkboard size={size} white={white} grey={grey} />;
};

export default CheckboardWrapper;
