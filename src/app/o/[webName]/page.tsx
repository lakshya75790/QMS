import Link from "next/link";
import Image from "next/image";
import {
  CalendarCheck,
  Clock,
  MapPin,
  Phone,
  Shield,
  Smartphone,
} from "lucide-react";
import BookLinkButton from "@/feature/organization/components/sections/BookLinkButton";
import Title from "@/feature/organization/components/sections/Title";
import { PagePropsPromise } from "@/types";
import { db } from "@/lib/db/db";
import { organizations, organizationUsers, users } from "@/lib/db/schema";
import { desc, eq, ilike } from "drizzle-orm";
import { notFound } from "next/navigation";
import UserType from "@/feature/organization/components/sections/UserType";

export const revalidate = 3600;

export const dynamicParams = true;

const getData = async (rawOrgName: string) => {
  try {
    if (!rawOrgName || rawOrgName === "undefined" || rawOrgName === "null") {
      return null;
    }
    const orgName = decodeURIComponent(rawOrgName).toLowerCase().trim();
    const org = await db
      .select({
        doctorWebName: organizations.doctorWebName,
        serviceStartDate: organizations.serviceStartDate,
        description: organizations.description,
        orgType: organizations.orgType,
        serviceEndDate: organizations.serviceEndDate,
        userLimit: organizations.userLimit,
        name: users.name,
        phone: users.phone,
        orgEmail: organizations.orgEmail,
        businessType: organizations.businessType,
      })
      .from(organizations)
      .leftJoin(
        organizationUsers,
        eq(organizations.id, organizationUsers.organizationId),
      )
      .leftJoin(users, eq(organizationUsers.userId, users.id))
      .where(ilike(organizations.doctorWebName, orgName))
      .limit(1)
      .then((rows) => rows[0]);

    return org || null;
  } catch (error) {
    console.error("Error fetching org in page:", error);
    return null;
  }
};

export async function generateStaticParams() {
  try {
    // Fetch top 20 most recently updated organizations that are enabled
    // This ensures we're pre-rendering the most active and relevant pages
    const topOrgs = await db
      .select({ webName: organizations.doctorWebName })
      .from(organizations)
      .where(eq(organizations.enabled, true))
      .orderBy(desc(organizations.updatedAt))
      .limit(20);

    // Return the webNames as params for static generation
    return topOrgs.map((org) => ({
      webName: org.webName,
    }));
  } catch (error) {
    console.error("Error fetching organizations for static params:", error);
    return [];
  }
}

export default async function Home({ params }: PagePropsPromise) {
  const webName = (await params).webName;
  const data = await getData(webName);

  let dynamicExport = "auto";
  if (!data || "error" in data) {
    // For non-existent organizations, we want to prevent caching
    // by setting a dynamic export at runtime
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    dynamicExport = "force-dynamic";
    return notFound();
  }

  const webSpan = <span className="capitalize"> {data?.doctorWebName}</span>;

  const orgDisplayType =
    data.orgType === "HOSPITAL"
      ? "hospital or clinic"
      : data.businessType?.toLowerCase() || "service provider";

  const orgNameSpan = <span className="capitalize">{data.doctorWebName}</span>;

  const appPurposeLine =
    data.orgType === "HOSPITAL"
      ? `lets you book medical appointments from your phone.`
      : `lets you book services directly from your phone.`;

  const img =
    data?.orgType === "HOSPITAL" ? "/doctor.webp" : "/other-landing.png";

  return (
    <div className="flex min-h-screen flex-col">
      <Title />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Skip the Queue, Book Your Appointment or Service Online
                  </h1>
                  <div className="max-w-[600px] md:text-xl">
                    <span className="mr-2 capitalize">{orgNameSpan}</span>
                    {appPurposeLine} No more waiting in long queues — get your
                    token and arrive just in time.
                  </div>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <BookLinkButton />
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-sm">
                  <Image
                    src={img}
                    width={320}
                    height={600}
                    alt="MediScan App Interface"
                    className="mx-auto rounded-2xl border shadow-xl"
                  />
                  <div className="absolute -right-12 -top-6 hidden md:block">
                    <div className="rounded-full bg-primary p-3 text-primary-foreground shadow-lg">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div className="mt-2 rounded-lg bg-background p-2 text-sm font-medium shadow-lg">
                      Save time
                    </div>
                  </div>
                  <div className="absolute -left-12 bottom-12 hidden md:block">
                    <div className="rounded-full bg-primary p-3 text-primary-foreground shadow-lg">
                      <CalendarCheck className="h-6 w-6" />
                    </div>
                    <div className="mt-2 rounded-lg bg-background p-2 text-sm font-medium shadow-lg">
                      Easy booking
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="w-full bg-muted py-12 md:py-24 lg:py-32"
        >
          <div className="px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                  Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Why Choose {orgNameSpan}?
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Our platform is designed to make booking and managing
                  queue-based services fast and hassle-free — whether at a{" "}
                  {orgDisplayType} or other service center.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex h-full flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-sm">
                <div className="rounded-full bg-primary p-3 text-primary-foreground">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Save Time</h3>
                <p className="text-center text-muted-foreground">
                  No more waiting in long queues. Book your appointment and
                  arrive just in time.
                </p>
              </div>
              <div className="flex h-full flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-sm">
                <div className="rounded-full bg-primary p-3 text-primary-foreground">
                  <Smartphone className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Mobile Booking</h3>
                <p className="text-center text-muted-foreground">
                  Book, reschedule, or cancel appointments directly from your
                  mobile device.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-sm">
                <div className="rounded-full bg-primary p-3 text-primary-foreground">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Multiple Locations</h3>
                <p className="text-center text-muted-foreground">
                  Choose from a range of service providers or locations for
                  maximum convenience.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-sm">
                <div className="rounded-full bg-primary p-3 text-primary-foreground">
                  <Phone className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Reminders</h3>
                <p className="text-center text-muted-foreground">
                  Get timely notifications and reminders about your upcoming
                  appointments.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-sm">
                <div className="rounded-full bg-primary p-3 text-primary-foreground">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Secure & Private</h3>
                <p className="text-center text-muted-foreground">
                  Your information is always secure and private with our
                  encrypted platform.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-sm">
                <div className="rounded-full bg-primary p-3 text-primary-foreground">
                  <CalendarCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Easy Rescheduling</h3>
                <p className="text-center text-muted-foreground">
                  Need to change your appointment? Reschedule with just a few
                  taps.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
          <div className="px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                  Process
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  How It Works
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Booking your spot is simple and efficient with {orgNameSpan} —
                  whether for a {orgDisplayType} or other service.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 md:grid-cols-3">
              <div className="flex h-full flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  1
                </div>
                <h3 className="text-xl font-bold"> Register</h3>
                <p className="text-center text-muted-foreground">
                  Register the {webSpan}
                  app and create your account with basic information.
                </p>
              </div>
              <div className="flex h-full flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  2
                </div>
                {orgDisplayType.includes("hospital")
                  ? "Book Appointment"
                  : "Book Service"}

                <p className="text-center text-muted-foreground">
                  Choose the service, provider, date, and time that works for
                  you.
                </p>
              </div>
              <div className="flex h-full flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  3
                </div>
                <h3 className="text-xl font-bold">Get Your Token</h3>
                <p className="text-center text-muted-foreground">
                  Receive a digital token with your appointment details and
                  arrive just in time.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="testimonials"
          className="w-full bg-muted py-12 md:py-24 lg:py-32"
        >
          <div className="px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                  Testimonials
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  What Our Users Say
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Don&apos;t just take our word for it - hear from people who
                  have used {webSpan}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col justify-between space-y-4 rounded-lg border bg-background p-6 shadow-sm">
                <div className="space-y-2">
                  <div className="flex space-x-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5 text-yellow-500"
                      >
                        <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-muted-foreground">
                    {webSpan}
                    saved me hours of waiting time. I booked my appointment from
                    home and walked right in at my appointment time.
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-muted p-1">
                    <div className="h-8 w-8 rounded-full bg-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Sarah</p>
                    <p className="text-xs text-muted-foreground">
                      <UserType />
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between space-y-4 rounded-lg border bg-background p-6 shadow-sm">
                <div className="space-y-2">
                  <div className="flex space-x-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5 text-yellow-500"
                      >
                        <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-muted-foreground">
                    As a busy professional, I love being able to schedule
                    appointments around my workday. The reminders are super
                    helpful.
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-muted p-1">
                    <div className="h-8 w-8 rounded-full bg-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Rahul</p>
                    <p className="text-xs text-muted-foreground">
                      Software Engineer
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between space-y-4 rounded-lg border bg-background p-6 shadow-sm">
                <div className="space-y-2">
                  <div className="flex space-x-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5 text-yellow-500"
                      >
                        <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-muted-foreground">
                    I had to reschedule my Appointment twice due to work
                    conflicts, and it was so easy to do it through the app.
                    Great service!
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-muted p-1">
                    <div className="h-8 w-8 rounded-full bg-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Priya Patel</p>
                    <p className="text-xs text-muted-foreground">Teacher</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="download" className="w-full py-12 md:py-24 lg:py-32">
          <div className="grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Use the
                {webSpan} Web App Today
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                Available on any browser. Start booking your appointments or
                services with ease.
              </p>
            </div>
            {/* <div className="flex flex-col gap-2 min-[400px]:flex-row lg:justify-end">
              <Button size="lg" className="gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M12 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5.5" />
                  <path d="M16 3v4" />
                  <path d="M8 3v4" />
                  <path d="M3 11h18" />
                  <path d="M19 16v6" />
                  <path d="M22 19l-3-3-3 3" />
                </svg>
                App Store
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M3 9h.01M21 9h.01M3 15h.01M21 15h.01M12 3v18" />
                  <path d="M3 3v18h18V3z" />
                </svg>
                Google Play
              </Button>
            </div> */}
          </div>
        </section>
      </main>
      <footer className="w-full border-t bg-background">
        <div className="flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex items-center gap-2">
            <Image
              src="/placeholder.svg?height=24&width=24"
              alt="MediScan Logo"
              width={24}
              height={24}
              className="rounded-md"
            />
            <span className="text-lg font-bold">{webSpan}</span>
          </div>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()}
            {webSpan} . All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
