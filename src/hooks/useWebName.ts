"use client";
import { useParams } from "next/navigation";

const useWebName = () => {
  const { webName } = useParams();
  const decoded =
    typeof webName === "string"
      ? decodeURIComponent(webName).trim()
      : Array.isArray(webName)
        ? decodeURIComponent(webName[0]).trim()
        : undefined;
  return { webName: decoded as string };
};

export default useWebName;

