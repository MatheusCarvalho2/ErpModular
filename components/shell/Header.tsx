import { LogoutButton } from "@/components/shell/LogoutButton";

type HeaderProps = {
  userName: string;
  userEmail: string;
  companyName: string;
};

export function Header({ userName, userEmail, companyName }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/modsystem_logo_primary.svg"
          alt="ModSystem"
          className="h-8 w-auto"
        />
        <span className="hidden truncate text-sm text-slate-500 sm:inline">
          {companyName}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-800">{userName}</p>
          <p className="text-xs text-slate-500">{userEmail}</p>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
