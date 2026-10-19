const section = "mt-8";
const h2 = "text-xl font-semibold";
const p = "mt-2 text-slate-700 leading-relaxed";

export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Draft for review by [CAA / the organizers] before launch. Version 2026-10-draft.
      </p>
      <h1 className="mt-6 text-4xl font-normal tracking-tight">Privacy, data use and project ownership</h1>
      <p className={p}>
        This page explains what TeamForge collects, who can see it, and who owns the work you submit. You accept it when you
        create an account, and you confirm the ownership part again each time you submit a project.
      </p>

      <section className={section}>
        <h2 className={h2}>What we collect</h2>
        <p className={p}>
          Your name, email address, challenge track and password (stored only as a hash). We also store what you add to the
          platform: teams, tasks, progress updates, milestones, and submission details and links.
        </p>
      </section>

      <section className={section}>
        <h2 className={h2}>How we use it</h2>
        <p className={p}>
          To run the competition: forming teams, letting teams work together, reviewing and judging submissions, and sending
          you notifications about invitations, deadlines and announcements. Password reset emails are sent when you ask for one.
        </p>
      </section>

      <section className={section}>
        <h2 className={h2}>Who can see what</h2>
        <p className={p}>
          Your teammates see your name, track and role in the team. Competition administrators can see participant and project
          details, including email addresses, in order to manage the event. Other participants can find you by name when
          inviting teammates, and your email is shown to them only partly hidden.
        </p>
        <p className={p}>
          A project becomes public only when its team lead gives consent <strong>and</strong> an administrator approves it. A
          public page shows the project name, summary, team member names and roles, and the links the team submitted. You can
          withdraw consent at any time from the project workspace, and the project will leave the public showcase.
        </p>
      </section>

      <section className={section}>
        <h2 className={h2}>Project ownership and intellectual property</h2>
        <p className={p}>
          [To be confirmed by the organizers.] Draft position: the team keeps ownership of the work it creates. By submitting,
          the team gives [CAA] permission to review, evaluate and, if the team has given public consent, display the project and
          its submitted materials for the purposes of the competition. Teams must only submit work they own or have permission
          to use, and must respect third-party licences.
        </p>
      </section>

      <section className={section}>
        <h2 className={h2}>Keeping your data</h2>
        <p className={p}>
          [Retention period to be confirmed.] To ask for your data to be corrected or deleted, contact [contact email].
        </p>
      </section>

      <section className={section}>
        <h2 className={h2}>Security</h2>
        <p className={p}>
          Passwords are hashed, access to admin tools is restricted to administrators, and requests are rate limited. No system
          is perfectly secure, so please use a password you do not use anywhere else.
        </p>
      </section>
    </div>
  );
}