import React from "react";
import QrCodeView from "@/components/qrcode/QrCodeView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { LinkIcon } from "lucide-react";
import { PagePropsPromise } from "@/types";
import { getAbsoluteUrl } from "@/lib/utils/urlUtils";

export const dynamic = "force-static";

const page = async ({ params }: PagePropsPromise) => {
  const webName = (await params).webName;
  if (!webName) return null;

  const enrollPath = getAbsoluteUrl(`/o/${webName}/enroll`);

  return (
    <div className="grid grid-cols-1 gap-4 p-2 md:grid-cols-2 md:p-20">
      <Card className="flex flex-col items-center justify-center px-2 py-10">
        <CardHeader>
          <CardTitle>Enroll to Scan</CardTitle>
        </CardHeader>
        <CardContent className="flex w-full flex-col items-center md:h-96">
          <QrCodeView
            title={process.env.NEXT_PUBLIC_WEB_NAME}
            value={enrollPath}
            size={1024}
            className="object-contain"
            style={{
              width: "100%",
              height: "100%",
            }}
          />
          <Link
            href={enrollPath}
            className="my-2 flex items-center gap-4 text-lg font-bold text-blue-500"
          >
            Book Appointment <LinkIcon />
          </Link>
        </CardContent>
      </Card>

      <Card className="flex flex-col items-center justify-center px-2 py-10">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="flex h-96 min-h-fit">
          <ol className="list-decimal space-y-3">
            <li>
              Open your smartphone&apos;s camera app and point it at the QR
              code.
            </li>
            <li>
              Tap the notification that appears to open the enrollment link.
            </li>
            <li>
              Complete the user-friendly enrollment form with your details.
            </li>
            <li>
              Review your information and submit the form to finalize your
              enrollment.
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default page;
