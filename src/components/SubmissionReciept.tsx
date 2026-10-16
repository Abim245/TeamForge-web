import { CheckCircle2 } from "lucide-react";

interface Props {
  projectName: string;
  submittedAt: string;
  deadline: string | null;
  locked: boolean;
}

export default function SubmissionReceipt({ projectName, submittedAt, deadline, locked }: Props) {
  const when = new Date(submittedAt).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" });
  return (
    <div className="mb-6 flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
      <CheckCircle2 size={22} className="mt-0.5 shrink-0" />
      <div>
        <p className="font-semibold">Submission received</p>
        <p className="mt-1 text-sm">{projectName} was submitted on {when}.</p>
        <p className="mt-1 text-sm">
          {locked
            ? "Submissions are now closed, so nothing can be changed."
            : deadline
            ? `You can still edit and submit again until ${new Date(deadline).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}.`
            : "You can still edit and submit again until the organizers close submissions."}
        </p>
      </div>
    </div>
  );
}