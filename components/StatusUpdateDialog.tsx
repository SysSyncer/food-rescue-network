import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type StatusUpdateDialogProps = {
  donationId: string;
  newStatus: string;
  updateDonationStatus: (donationId: string, newStatus: string) => void;
};

const StatusUpdateDialog = ({
  donationId,
  newStatus,
  updateDonationStatus,
}: StatusUpdateDialogProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>{`Mark as ${newStatus}`}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Status Update</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to update the status to{" "}
            <strong>{newStatus}</strong>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => updateDonationStatus(donationId, newStatus)}
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default StatusUpdateDialog;
