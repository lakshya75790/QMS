"use client";

import type React from "react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Download, ExternalLink } from "lucide-react";
import html2canvas from "html2canvas";
import Link from "next/link";
import QrVariants from "@/components/qrcode/QrVariants";
import { getAbsoluteUrl } from "@/lib/utils/urlUtils";

interface QrCodeViewProps
  extends React.DetailedHTMLProps<
    React.CanvasHTMLAttributes<HTMLCanvasElement>,
    HTMLCanvasElement
  > {
  value: string;
  webName: string;
  size?: number;
  title?: string;
  logoUrl?: string;
}

const QrCodeDisplay = ({
  value,
  webName,
  title = "Scan QR Code",
}: QrCodeViewProps) => {
  const qrUrl = getAbsoluteUrl(value || `/o/${webName}/enroll`);
  // const scanRef = useRef<HTMLDivElement>(null);
  const queueRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState<"scannable" | "queue" | null>(
    null,
  );

  const handleDownload = async (
    ref: React.RefObject<HTMLDivElement | null>,
    suffix: string,
  ) => {
    if (!ref.current) return;

    try {
      setDownloading(suffix as "scannable" | "queue");

      const cardElement = ref.current.closest(".qr-card");
      if (!cardElement) return;

      const canvas = await html2canvas(cardElement as HTMLElement, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const link = document.createElement("a");
      const l = `${decodeURIComponent(webName).replaceAll(" ", "-")}-qr.png`;
      link.download = l;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating QR code image:", error);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* <div>
        <QrVariants
          qrRef={scanRef}
          value={value}
          variant="scannable"
          webName={webName}
          title={`${title}`}
        />
        <CardFooter className="flex justify-center gap-4 pb-6">
          <Button
            onClick={() => handleDownload(scanRef, "scannable")}
            disabled={downloading === "scannable"}
            className="gap-2"
          >
            {downloading === "scannable" ? (
              <>
                <span className="mr-2 animate-spin">⏳</span>
                Generating...
              </>
            ) : (
              <>
                <Download size={18} />
                Download Scannable QR
              </>
            )}
          </Button>
        </CardFooter>
      </div> */}

      <div>
        <QrVariants
          qrRef={queueRef}
          value={qrUrl}
          variant="queue"
          webName={webName}
          title={`${title}`}
        />
        <CardFooter className="mt-2 flex justify-center gap-4">
          <Button
            onClick={() => handleDownload(queueRef, "queue")}
            disabled={downloading === "queue"}
            className="gap-2"
          >
            {downloading === "queue" ? (
              <>
                <span className="mr-2 animate-spin">⏳</span>
                Generating...
              </>
            ) : (
              <>
                <Download size={18} />
                Download Queue QR
              </>
            )}
          </Button>
        </CardFooter>
        <CardFooter className="flex justify-center gap-4 pb-6">
          <Link
            href={qrUrl}
            target="_blank"
            className="flex space-x-2 text-blue-500"
          >
            <ExternalLink /> View Link
          </Link>
        </CardFooter>
      </div>
    </div>
  );
};

export default QrCodeDisplay;
