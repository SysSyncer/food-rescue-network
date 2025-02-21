import SignOutButton from "@/components/SignOutButton";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  return (
    <>
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen gap-16 p-8 pb-20 sm:p-20">
        <div className="row-start-2 flex flex-col gap-5">
          <h1 className="text-5xl font-semibold pb-10">Hello there</h1>
          <div className="flex justify-center ">
            <SignOutButton />
          </div>
          <Link
            className="justify-center flex"
            href={"/dashboard/add-donation"}
          >
            <Button>Add Donation</Button>
          </Link>
        </div>
      </div>
    </>
  );
}
