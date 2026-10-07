import SubscriptionPopupAlert from "@/components/alerts/SubscriptionPopupAlert";
import Title from "@/feature/organization/components/sections/Title";
import OrgOverviewDetails from "@/feature/organization/overview/components/section/OrgOverviewDetails";
import QrCodeDisplay from "@/feature/organization/overview/components/section/QrCodeDisplay";
import { PagePropsPromise } from "@/types";
import { getAbsoluteUrl } from "@/lib/utils/urlUtils";
import React from "react";

const page = async ({ params }: PagePropsPromise) => {
  const webName = (await params).webName;
  const enrollPath = getAbsoluteUrl(`/o/${webName}/enroll`);

  return (
    <div className="">
      <Title />
      <SubscriptionPopupAlert />
      <OrgOverviewDetails />
      <div className="my-4 flex justify-start">
        <QrCodeDisplay
          value={enrollPath}
          title="Scan to Enroll"
          webName={webName}
        />
      </div>
    </div>
  );
};

export default page;
