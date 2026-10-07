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
    <div className="flex flex-col gap-6 w-full max-w-full items-center md:items-start">
      <div className="w-full max-w-[40rem] flex flex-col items-center">
        <QrVariants
          qrRef={queueRef}
          value={qrUrl}
          variant="queue"
          webName={webName}
          title={`${title}`}
        />
        <CardFooter className="mt-4 flex flex-wrap items-center justify-center gap-3 w-full px-2">
          <Button
            onClick={() => handleDownload(queueRef, "queue")}
            disabled={downloading === "queue"}
            className="gap-2 w-full sm:w-auto min-w-[160px]"
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
          <Link
            href={qrUrl}
            target="_blank"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-200 dark:border-blue-900 rounded-md bg-blue-50/50 dark:bg-blue-950/40 hover:bg-blue-100/50 dark:hover:bg-blue-900/50 transition-colors w-full sm:w-auto min-w-[140px]"
          >
            <ExternalLink size={16} /> View Link
          </Link>
        </CardFooter>
      </div>
    </div>
  );
};

export default QrCodeDisplay;
