import Image from "next/image";
import Link from "next/link";
import Icon from "@/public/icon.svg";
import FoodDonationImage from "@/public/donation.png";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      <div className="container absolute left-0 right-0 mx-auto">
        <header>
          <div className="flex items-center justify-between w-full gap-5 px-5 pt-5">
            <div className="flex items-center gap-10">
              <div className="flex items-center gap-4">
                <Link href={"/dashboard"}>
                  <Image src={Icon} alt={"logo"} />
                </Link>
                <h1 className="text-4xl font-semibold transition-opacity duration-150 ease-linear cursor-default text-light-black hover:opacity-75">
                  Foodscue
                </h1>
              </div>
              <nav className="flex items-center">
                <ul className="flex gap-10 pt-2">
                  <Link href={"/"}>
                    <li className="transition-opacity duration-150 ease-linear hover:opacity-65">
                      Home
                    </li>
                  </Link>
                  <Link href={"/dashboard"}>
                    <li className="transition-opacity duration-150 ease-linear hover:opacity-65">
                      Donations
                    </li>
                  </Link>
                  <Link href={"/dashboard"}>
                    <li className="transition-opacity duration-150 ease-linear hover:opacity-65">
                      Shelters
                    </li>
                  </Link>
                  <Link href={"/dashboard"}>
                    <li className="transition-opacity duration-150 ease-linear hover:opacity-65">
                      How it works
                    </li>
                  </Link>
                </ul>
              </nav>
            </div>
            <Link
              href={"/signin"}
              className="px-6 py-2 text-xl font-semibold transition-colors duration-100 ease-linear rounded-full outline-none ring-1 ring-light-black hover:ring-0 hover:bg-light-black bg-light-green text-light-black hover:text-white"
            >
              Sign In
            </Link>
          </div>
        </header>

        <Separator className="mt-5" />

        <main>
          <section className="flex">
            <div className="relative pt-5 mt-5">
              <Image
                src={FoodDonationImage}
                className="rounded-3xl"
                alt="Welcome page"
                width={950}
              />
              <h1 className="absolute bottom-4 right-2 text-white lg:text-5xl mix-blend-difference font-semibold max-w-[450px]">
                Rescue Surplus Food, Fight Hunger!
              </h1>
            </div>
            <div className="max-w-[550px] px-10">
              <h1 className="mt-24 font-bold lg:text-5xl justify-self-center">
                Join Us in Reducing Food Waste & Feeding Those in Need
              </h1>
              <p className="mt-5 text-xl italic font-medium indent-14">
                "Foodscue connects donors, volunteers, and shelters to ensure no
                meal goes to waste."
              </p>
              <div className="flex items-center gap-5">
                <Link href={"/signin"} className="outline-none">
                  <Button className="mt-5 font-semibold rounded-full ring-1 ring-light-black hover:ring-0 bg-light-green text-light-black hover:text-white">
                    Get started
                  </Button>
                </Link>
                <Link href={"/info"} className="outline-none">
                  <Button
                    className="mt-5 font-semibold text-light-black"
                    variant={"link"}
                  >
                    Learn more
                  </Button>
                </Link>
              </div>
              <Separator className="my-5" />
              <div>
                <h1 className="mb-5 text-2xl font-semibold">Testimonials</h1>
                <div className="grid grid-cols-3 gap-5">
                  <div className="flex flex-col items-center px-2 py-5 rounded-md bg-very-light ">
                    <span className="text-2xl font-bold">10,000+</span>
                    <h1 className="font-medium text-center">Meals Rescued</h1>
                  </div>
                  <div className="flex flex-col items-center px-2 py-5 rounded-md bg-very-light ">
                    <span className="text-2xl font-bold">500+</span>
                    <h1 className="font-medium text-center">
                      Volunteers Engaged
                    </h1>
                  </div>
                  <div className="flex flex-col items-center px-2 py-5 rounded-md bg-very-light ">
                    <span className="text-2xl font-bold">200+</span>
                    <h1 className="font-medium text-center">
                      Shelters Supported
                    </h1>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
      <footer>
        <div className="fixed inset-x-0 bottom-0 w-full bg-light-black">
          <div className="grid flex-col grid-cols-4 gap-1 px-5 py-2 my-2 justify-items-center">
            <Link
              href={"/about"}
              className="text-sm font-medium text-white underline underline-offset-2"
            >
              About Us
            </Link>
            <Link
              href={"/contact"}
              className="text-sm font-medium text-white underline underline-offset-2"
            >
              Contact
            </Link>
            <Link
              href={"/social-media"}
              className="text-sm font-medium text-white underline underline-offset-2"
            >
              Social Media
            </Link>
            <Link
              href={"/terms-and-conditions"}
              className="text-sm font-medium text-white underline underline-offset-2"
            >
              Terms & conditions
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
