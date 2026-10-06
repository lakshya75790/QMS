import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { client } from "@/lib/rpc";
import { formatDate } from "@/lib/utils/dateUtils";
import { InferResponseType } from "hono";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Package,
  Calendar,
} from "lucide-react";
import React from "react";
import ClientComponent from "./_ClientComponent";
import PrintReceiptDocument from "./_PrintReceiptDocument";
import UserType from "@/feature/organization/components/sections/UserType";
// import UserType from "@/feature/organization/components/sections/UserType";

//  InferResponseType<
//     typeof client.api.main.payments.appointment.view["a"][":appointmentId"]["$get"]
//   >
interface CompletePaymentOverviewSectionProps {
  paymentData:
    | InferResponseType<
        (typeof client.api.main.payments.appointment.view.u)[":userId"]["o"][":paymentId"]["$get"],
        200
      >
    | InferResponseType<
        (typeof client.api.main.payments.appointment.view)["a"][":appointmentId"]["$get"],
        200
      >;
  children?: React.ReactNode;
}

const CompletePaymentOverviewSection = ({
  paymentData,
  children,
}: CompletePaymentOverviewSectionProps) => {
  const paymentStatus = paymentData?.data.payment?.paymentStatus;

  return (
    <ClientComponent paymentId={paymentData?.data?.payment?.id}>
      <div className="space-y-6 print:hidden">
        <div className="mb-4 flex flex-col items-center gap-4 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full">
            {paymentStatus === "COMPLETED" ? (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            ) : paymentStatus === "PENDING" ? (
              <Package className="h-16 w-16 text-yellow-500" />
            ) : (
              <CreditCard className="h-16 w-16 text-destructive" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Payment{" "}
              {paymentStatus === "COMPLETED"
                ? "Successful!"
                : paymentStatus === "PENDING"
                  ? "Pending!"
                  : "Failed!"}
            </h1>
            {paymentStatus === "COMPLETED" && (
              <p className="mt-2 text-muted-foreground">
                Your payment of ₹
                {Number.parseFloat(
                  paymentData?.data?.payment.totalAmount,
                ).toLocaleString()}{" "}
                has been processed successfully.
              </p>
            )}
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Payment Details
            </CardTitle>
            <CardDescription>
              Transaction information and payment summary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Payment ID</p>
                <p className="font-medium">{paymentData?.data?.payment?.id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-medium">
                  ₹
                  {Number.parseFloat(
                    paymentData?.data?.payment?.totalAmount,
                  ).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="font-medium">
                  {paymentData?.data?.payment?.paymentMethod}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant="success" className="">
                  {paymentData?.data?.payment?.paymentStatus}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Payment Date</p>
                <p className="font-medium">
                  {formatDate(paymentData?.data?.payment?.createdAt)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Confirmation Date</p>
                <p className="font-medium">
                  {formatDate(paymentData?.data?.payment?.updatedAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Appointment Details
            </CardTitle>
            <CardDescription>
              Information about your scheduled appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <span>
                      <UserType /> Name
                    </span>
                  </TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(paymentData?.data?.appointments || []).map((item) => (
                  <TableRow key={item?.appointment?.id}>
                    <TableCell className="font-medium">
                      {item?.appointment?.patientName}
                    </TableCell>
                    <TableCell>{item?.appointment?.reasonForVisit}</TableCell>
                    <TableCell>{item?.appointment?.tokenNumber}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 hover:bg-blue-50"
                      >
                        {item?.appointment?.appointmentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      ₹
                      {Number.parseFloat(
                        item?.paymentLink?.amount || "0",
                      ).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Separator />
            <div className="flex w-full justify-between">
              <div className="text-sm font-medium">Total Amount</div>
              <div className="font-bold">
                ₹
                {Number.parseFloat(
                  paymentData?.data?.payment.totalAmount,
                ).toLocaleString()}
              </div>
            </div>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              What&apos;s Next?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex flex-col gap-2">
                <div className="font-medium">Appointment Confirmation</div>
                <p className="text-sm text-muted-foreground">
                  Your appointments have been confirmed. Please arrive 15 minutes
                  before your scheduled time and bring your token number.
                </p>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex flex-col gap-2">
                <div className="font-medium">Need to Reschedule?</div>
                <p className="text-sm text-muted-foreground">
                  If you need to reschedule your appointment, please contact our
                  support team at least 24 hours in advance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        {children}
      </div>
      <PrintReceiptDocument paymentData={paymentData} />
    </ClientComponent>
  );
};

export default CompletePaymentOverviewSection;
