import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfileIcon({ srcValue }: { srcValue: string }) {
  return (
    <>
      <Avatar>
        <AvatarImage src={srcValue} alt="@icon"></AvatarImage>
        <AvatarFallback>SC</AvatarFallback>
      </Avatar>
    </>
  );
}
