import type { IntegrationLogoId } from "@/lib/connectIntegrations";

export function IntegrationLogo({ id }: { id: IntegrationLogoId }) {
  switch (id) {
    case "typeform_contacts":
      return (
        <span
          className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
          style={{ background: "#7c3aed" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="9" cy="9" r="3" fill="currentColor" />
            <circle cx="16" cy="10" r="2.5" fill="currentColor" />
            <path
              d="M4 20c0-3 3-5 5-5s5 2 5 5"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </span>
      );
    case "facebook_pixel":
      return (
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1877f2] text-white text-xs font-bold">
          f
        </span>
      );
    case "google_analytics":
      return (
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-[#e8e8e8]">
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
            <path d="M4 18V8l4 3V18H4z" fill="#F9AB00" />
            <path d="M10 18V5l4 3v10h-4z" fill="#E37400" />
            <circle cx="18" cy="16" r="4" fill="#E37400" />
          </svg>
        </span>
      );
    case "hubspot":
      return (
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ff7a59]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="3" fill="#fff" />
            <circle cx="5" cy="8" r="2" fill="#fff" />
            <circle cx="19" cy="8" r="2" fill="#fff" />
            <path d="M7 8h10M12 9v3" stroke="#fff" strokeWidth="2" />
          </svg>
        </span>
      );
    case "google_sheets":
      return (
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0f9d58] text-white text-lg font-bold">
          G
        </span>
      );
    case "excel":
      return (
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#217346] text-white text-sm font-bold">
          X
        </span>
      );
    case "mailchimp":
      return (
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ffe01b]">
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
            <path
              d="M12 4c-2 3-6 4-6 8 0 3 2.5 5.5 6 6 3.5-.5 6-3 6-6 0-4-4-5-6-8z"
              fill="#241c15"
            />
          </svg>
        </span>
      );
    case "square":
      return (
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#006aff] text-white text-sm font-bold">
          □
        </span>
      );
    case "notion":
      return (
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-[#e8e8e8] text-xl font-semibold">
          N
        </span>
      );
    case "slack":
      return (
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-[#e8e8e8]">
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
            <rect x="4" y="9" width="4" height="8" rx="2" fill="#36C5F0" />
            <rect x="9" y="4" width="8" height="4" rx="2" fill="#2EB67D" />
            <rect x="16" y="9" width="4" height="8" rx="2" fill="#E01E5A" />
            <rect x="9" y="16" width="8" height="4" rx="2" fill="#ECB22E" />
          </svg>
        </span>
      );
    case "microsoft_teams":
      return (
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6264a7] text-white text-xs font-bold">
          T
        </span>
      );
    case "salesforce":
      return (
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00a1e0] text-white text-xs font-bold">
          SF
        </span>
      );
    case "airtable":
      return (
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fcb400] text-[#333] text-sm font-bold">
          A
        </span>
      );
    case "google_tag_manager":
      return (
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-[#e8e8e8]">
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" fill="#8AB4F8" />
            <circle cx="12" cy="12" r="3" fill="#4285F4" />
          </svg>
        </span>
      );
    case "freshdesk":
      return (
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#25c16f] text-white text-xs font-bold">
          FD
        </span>
      );
    case "dropbox":
      return (
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0061ff]">
          <svg width="22" height="14" viewBox="0 0 24 16" aria-hidden>
            <path fill="#fff" d="M6 0L0 4l6 4 6-4-6-4zm12 0l-6 4 6 4 6-4-6-4zM0 12l6 4 6-4-6-4-6 4zm12 0l6 4 6-4-6-4-6 4z" />
          </svg>
        </span>
      );
    default:
      return <span className="h-10 w-10 rounded-lg bg-[#eee]" />;
  }
}
