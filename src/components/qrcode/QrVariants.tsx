import React from "react";
import QrCodeView from "./QrCodeView";
import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { useGetOrgDetailsByWebName } from "@/feature/organization/hooks/useGetOrgByWebName";

interface QrVariantsProps {
  qrRef: React.RefObject<HTMLDivElement | null>;
  webName: string;
  value: string;
  variant: "queue" | "scannable";
  title?: string;
}
const QrVariants = ({
  qrRef,
  value,
  webName,
  variant,
  title,
}: QrVariantsProps) => {
  const { data: orgDetails } = useGetOrgDetailsByWebName();
  const webNameLength = orgDetails?.doctorWebName?.length || 24;

  const fontSize =
    webNameLength < 25
      ? "text-sm sm:text-lg md:text-2xl"
      : webNameLength <= 30
        ? "text-xs sm:text-base md:text-xl"
        : webNameLength <= 35
          ? "text-xs sm:text-sm md:text-lg"
          : "text-[10px] sm:text-xs md:text-base";

  switch (variant) {
    case "scannable":
      return (
        <div className="qr-card w-full max-w-lg rounded-xl bg-white shadow-sm border overflow-hidden">
          <CardHeader className="bg-primary/5 p-4 sm:p-6">
            <CardTitle className="text-center text-primary text-base sm:text-lg md:text-xl">
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center p-4 sm:p-6">
            <div
              ref={qrRef}
              className="rounded-lg p-2 sm:p-4 shadow-inner flex items-center justify-center w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 max-w-[70vw] max-h-[70vw] bg-white"
            >
              <QrCodeView
                value={value}
                size={1024}
                className="w-full h-full object-contain"
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
          </CardContent>
        </div>
      );
    case "queue":
      return (
        <div
          className={`qr-card relative flex flex-col items-center justify-between w-full max-w-[40rem] aspect-square rounded-xl bg-contain bg-center bg-no-repeat px-4 sm:px-8 py-4 sm:py-8 md:py-12 shadow-lg overflow-hidden ${
            orgDetails?.orgType === "HOSPITAL"
              ? "bg-[url(/qr-bg.png)]"
              : "bg-[url(/other-qr-bg.jpg)]"
          }`}
        >
          <div
            ref={qrRef}
            className="w-full max-w-md text-start font-semibold text-blue-900 px-2"
          >
            <p className="text-xs sm:text-base md:text-xl">Book Your appointment </p>
            <p className="text-xs sm:text-base md:text-xl">
              with
              <span className={`mx-1 font-bold uppercase ${fontSize}`}>
                {decodeURIComponent(webName)}
              </span>
            </p>
          </div>
          <p className="text-[11px] sm:text-sm md:text-base text-primary text-center font-medium px-2">
            No waiting no stress just scan and relax.
          </p>
          <div className="my-1 sm:my-2 md:my-3 flex items-center justify-center w-36 h-36 sm:w-52 sm:h-52 md:w-60 md:h-60 max-w-[55vw] max-h-[55vw] p-1.5 sm:p-2 bg-white rounded-lg shadow-sm">
            <QrCodeView
              value={value}
              size={512}
              className="w-full h-full object-contain"
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </div>
          <p className="max-w-xs sm:max-w-sm text-center text-[11px] sm:text-sm md:text-base font-bold text-primary px-2">
            Save your energy for healing, not standing.
          </p>
        </div>
      );
    default:
      return null;
  }
};

export default QrVariants;
