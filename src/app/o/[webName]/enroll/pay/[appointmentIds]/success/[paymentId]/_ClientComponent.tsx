"use client";

import { useEffect, useRef, useState } from "react";
import { Printer } from "lucide-react";
// import { format } from "date-fns";
// import { jsPDF } from "jspdf";
// import html2canvas from "html2canvas";

import { Button } from "@/components/ui/button";

import { Children } from "@/types";
// import useWebName from "@/hooks/useWebName";

const ClientComponent = ({
  children,
  //   paymentId,
}: Children & { paymentId: string }) => {
  //   const [isDownloading, setIsDownloading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrintReceipt = () => {
    setIsPrinting(true);
    // Simulate print delay
    setTimeout(() => {
      setIsPrinting(false);
      window.print();
    }, 1000);
  };

  useEffect(() => {
    setIsMounted(true);

    return () => {};
  }, []);

  if (!isMounted) return null;

  //   const { webName } = useWebName();
  //   const handleDownloadReceipt = async () => {
  //     if (!receiptRef.current) return;

  //     setIsDownloading(true);

  //     try {
  //       // Create a clone of the receipt element to modify for PDF
  //       const receiptElement = receiptRef.current.cloneNode(true) as HTMLElement;

  //       // Remove the buttons section from the clone
  //       const buttonsSection = receiptElement.querySelector("[data-buttons]");
  //       if (buttonsSection) {
  //         buttonsSection.remove();
  //       }

  //       // Add a receipt header
  //       const header = document.createElement("div");
  //       header.innerHTML = `
  //             <div style="text-align: center; margin-bottom: 20px;">
  //               <h1 style="font-size: 24px; margin-bottom: 5px;">Payment Receipt</h1>
  //               <p style="font-size: 14px; color: #666;">Generated on ${format(new Date(), "PPP")}</p>
  //             </div>
  //           `;
  //       receiptElement.insertBefore(header, receiptElement.firstChild);

  //       // Apply some styles for better PDF rendering
  //       receiptElement.style.padding = "20px";
  //       receiptElement.style.backgroundColor = "white";

  //       // Temporarily append the clone to the document for html2canvas
  //       receiptElement.style.position = "absolute";
  //       receiptElement.style.left = "-9999px";
  //       document.body.appendChild(receiptElement);

  //       // Create canvas from the element
  //       const canvas = await html2canvas(receiptElement, {
  //         scale: 2,
  //         useCORS: true,
  //         logging: false,
  //         backgroundColor: "#ffffff",
  //       });

  //       // Remove the temporary element
  //       document.body.removeChild(receiptElement);

  //       // Create PDF
  //       const imgData = canvas.toDataURL("image/png");
  //       const pdf = new jsPDF({
  //         orientation: "portrait",
  //         unit: "mm",
  //         format: "a4",
  //       });

  //       const imgWidth = 210; // A4 width in mm
  //       const imgHeight = (canvas.height * imgWidth) / canvas.width;

  //       pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

  //       // Generate filename with payment ID and date
  //       const filename = `Receipt_${webName || ""}_${paymentId}_${format(new Date(), "yyyy-MM-dd")}.pdf`;

  //       // Download the PDF
  //       pdf.save(filename);

  //       // Show success toast or notification here if needed
  //     } catch (error) {
  //       console.error("Error generating PDF:", error);
  //       // Show error toast or notification here if needed
  //     } finally {
  //       setIsDownloading(false);
  //     }
  //   };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10" ref={receiptRef}>
      <div className="flex flex-col gap-8">
        {children}

        <div
          className="flex flex-col justify-center gap-4 sm:flex-row print:hidden"
          data-buttons
        >
          <Button
            variant="outline"
            className="gap-2"
            onClick={handlePrintReceipt}
            disabled={isPrinting}
          >
            <Printer className="h-4 w-4" />
            {isPrinting ? "Printing..." : "Print Receipt"}
          </Button>
          {/* <Button
            variant="outline"
            className="gap-2"
            onClick={handleDownloadReceipt}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download Receipt
              </>
            )}
          </Button> */}
          {/* <Button className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Return to Dashboard
          </Button> */}
        </div>
      </div>
    </div>
  );
};

export default ClientComponent;
