import Image from "next/image";
import Link from "next/link";
import Icon from "@/public/icon.svg";
import FoodDonationImage from "@/public/donation.png";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      <div className="container absolute left-0 right-0 mx-auto overflow-x-hidden">
        <header>
          <div className="flex items-center justify-between w-full gap-5 px-5 pt-5">
            <div className="flex items-center gap-10">
              <div className="flex items-center gap-4">
                <Link href={"/dashboard"}>
                  <Image src={Icon} alt={"logo"} />
                </Link>
                <h1 className="font-semibold transition-opacity duration-150 ease-linear cursor-default lg:text-4xl md:text-3xl text-light-black hover:opacity-75">
                  Foodscue
                </h1>
              </div>
              <nav className="flex items-center">
                <ul className="hidden lg:flex lg:gap-10 lg:pt-2">
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
          <section className="flex flex-col px-10 mt-5 mb-20 xl:flex-row">
            <div className="relative self-center">
              <Image
                src={FoodDonationImage}
                className="rounded-3xl"
                alt="Welcome page"
                width={1750}
              />
              <h1 className="absolute md:top-[80%] md:-right-16 md:text-3xl md:max-w-[450px] lg:top-[83%] xl:top-[77%] 2xl:top-[82%] 2xl:right-3 right-0 xl:text-4xl xl:max-w-[320px] xl:right-2 text-white sm:text-xl lg:text-5xl mix-blend-exclusion font-semibold max-w-[450px]">
                Rescue Surplus Food, Fight Hunger!
              </h1>
            </div>
            <div className="self-center px-10 py-5">
              <h1 className="font-bold lg:text-5xl md:text-4xl lg:mt-5 justify-self-center">
                Join Us in Reducing Food Waste & Feeding Those in Need
              </h1>
              <p className="mt-5 text-xl italic font-medium lg:mt-10 indent-14">
                "Foodscue connects donors, volunteers, and shelters to ensure no
                meal goes to waste."
              </p>
              <div className="flex items-center gap-5">
                <Link href={"/signin"} className="mt-5 outline-none lg:mt-10 ">
                  <Button className="font-semibold rounded-full ring-1 ring-light-black hover:ring-0 bg-light-green text-light-black hover:text-white">
                    Get started
                  </Button>
                </Link>
                <Link href={"/info"} className="mt-5 outline-none lg:mt-10 ">
                  <Button
                    className="font-semibold text-light-black"
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
                    <span className="text-2xl font-bold">0</span>
                    <h1 className="font-medium text-center">Meals Rescued</h1>
                  </div>
                  <div className="flex flex-col items-center px-2 py-5 rounded-md bg-very-light ">
                    <span className="text-2xl font-bold">0</span>
                    <h1 className="font-medium text-center">
                      Volunteers Engaged
                    </h1>
                  </div>
                  <div className="flex flex-col items-center px-2 py-5 rounded-md bg-very-light ">
                    <span className="text-2xl font-bold">0</span>
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
          <div className="flex items-center justify-between px-8 py-4 border-t-2 border-light-green">
            <div className="font-medium text-white">
              <Link href={"https://github.com/syssyncer"}>
                Made with &#9829; SysSyncer
              </Link>
            </div>
            <div className="flex gap-5">
              <Link
                href={"/about"}
                className="text-sm font-medium text-white hover:underline"
              >
                About Us
              </Link>
              <Link
                href={"/contact"}
                className="text-sm font-medium text-white hover:underline"
              >
                Contact
              </Link>
              <Link
                href={"/social-media"}
                className="text-sm font-medium text-white hover:underline"
              >
                Social Media
              </Link>
              <Link
                href={"/terms-and-conditions"}
                className="text-sm font-medium text-white hover:underline"
              >
                Terms & conditions
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
