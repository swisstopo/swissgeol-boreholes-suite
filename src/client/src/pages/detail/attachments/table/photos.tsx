import { FC } from "react";

interface PhotosProps {
  boreholeId: number;
}

export const Photos: FC<PhotosProps> = ({ boreholeId }) => {
  return <>{boreholeId}</>;
};
