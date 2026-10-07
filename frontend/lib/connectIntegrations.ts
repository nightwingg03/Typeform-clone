export type IntegrationCategory =
  | "Analytics & reporting"
  | "Automation"
  | "CMS"
  | "Collaboration"
  | "Customer support"
  | "Developer tools"
  | "Documents"
  | "File management"
  | "Lead generation";

export type IntegrationLogoId =
  | "typeform_contacts"
  | "facebook_pixel"
  | "google_analytics"
  | "hubspot"
  | "google_sheets"
  | "excel"
  | "mailchimp"
  | "square"
  | "notion"
  | "slack"
  | "microsoft_teams"
  | "salesforce"
  | "airtable"
  | "google_tag_manager"
  | "freshdesk"
  | "dropbox";

export type IntegrationAction = "connect" | "manage" | "upgrade";

export interface IntegrationItem {
  id: string;
  name: string;
  description: string;
  action: IntegrationAction;
  logo: IntegrationLogoId;
  categories: IntegrationCategory[];
  premiumBadge?: boolean;
}

export const INTEGRATION_CATEGORIES: IntegrationCategory[] = [
  "Analytics & reporting",
  "Automation",
  "CMS",
  "Collaboration",
  "Customer support",
  "Developer tools",
  "Documents",
  "File management",
  "Lead generation",
];

export const CONNECT_INTEGRATIONS: IntegrationItem[] = [
  {
    id: "typeform-contacts",
    name: "Typeform contacts",
    description:
      "Map form responses to create or update your contacts and trigger automations.",
    action: "manage",
    logo: "typeform_contacts",
    categories: ["Lead generation", "Collaboration"],
  },
  {
    id: "facebook-pixel",
    name: "Facebook Pixel",
    description:
      "Add your Facebook pixel ID and get all the data you need to measure and optimize your marketing campaigns. Available on some paid plans.",
    action: "connect",
    logo: "facebook_pixel",
    categories: ["Analytics & reporting", "Developer tools"],
    premiumBadge: true,
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    description:
      "Discover how people find and interact with your typeform. Get the data you need to measure campaigns, improve conversions, and more.",
    action: "connect",
    logo: "google_analytics",
    categories: ["Analytics & reporting"],
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description:
      "Send contact, company, or deal info to HubSpot to quickly follow up on new leads or update existing details to your free HubSpot account.",
    action: "connect",
    logo: "hubspot",
    categories: ["Lead generation"],
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    description:
      "Send your data straight to Google Sheets. Automatically syncs as results come in.",
    action: "connect",
    logo: "google_sheets",
    categories: ["Documents", "Collaboration"],
  },
  {
    id: "excel",
    name: "Excel",
    description:
      "Send your typeform responses to Excel Online. Turn feedback into graphs, support queries into workflows, and much more.",
    action: "connect",
    logo: "excel",
    categories: ["Documents"],
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description:
      "Send new contacts to your Mailchimp audiences, and tag them so they're easy to organize.",
    action: "connect",
    logo: "mailchimp",
    categories: ["Lead generation"],
  },
  {
    id: "square",
    name: "Square",
    description:
      "Recommend products from your online store, create new leads in Square CRM, and embed typeforms in Square Online sites.",
    action: "connect",
    logo: "square",
    categories: ["Lead generation", "CMS"],
  },
  {
    id: "notion",
    name: "Notion",
    description: "Send data to your Notion database",
    action: "connect",
    logo: "notion",
    categories: ["Collaboration", "Documents"],
  },
  {
    id: "slack",
    name: "Slack",
    description:
      "Notify a channel or individual in Slack with real-time typeform responses so the right person can react in an instant.",
    action: "connect",
    logo: "slack",
    categories: ["Collaboration"],
  },
  {
    id: "microsoft-teams",
    name: "Microsoft Teams",
    description:
      "Send a message in Microsoft Teams channels when your typeform is answered.",
    action: "connect",
    logo: "microsoft_teams",
    categories: ["Collaboration"],
  },
  {
    id: "salesforce-create",
    name: "Create with Salesforce",
    description:
      "Send typeform responses to Salesforce as contacts, leads, and more. Available on Enterprise plans.",
    action: "upgrade",
    logo: "salesforce",
    categories: ["Lead generation"],
  },
  {
    id: "salesforce-classic",
    name: "Salesforce Classic",
    description:
      "Send typeform responses to Salesforce as contacts, leads, and more. Available on Premium plans.",
    action: "connect",
    logo: "salesforce",
    categories: ["Lead generation"],
  },
  {
    id: "airtable",
    name: "Airtable",
    description:
      "Send typeform responses to Airtable, where you can organize your data and collaborate easily. Available on paid plans.",
    action: "connect",
    logo: "airtable",
    categories: ["Collaboration", "Documents"],
  },
  {
    id: "google-tag-manager",
    name: "Google Tag Manager",
    description:
      "Add your own code snippets to typeforms for conversion tracking, site analytics, retargeting, and more. Available on some paid plans.",
    action: "connect",
    logo: "google_tag_manager",
    categories: ["Analytics & reporting", "Developer tools"],
    premiumBadge: true,
  },
  {
    id: "freshdesk",
    name: "Freshdesk Classic",
    description:
      "Create new tickets in Freshdesk from your typeform submissions. Solve customer problems, fast.",
    action: "connect",
    logo: "freshdesk",
    categories: ["Customer support"],
  },
  {
    id: "dropbox",
    name: "Dropbox",
    description:
      "Send files from your typeform straight to any folder in Dropbox for better organization and collaboration.",
    action: "connect",
    logo: "dropbox",
    categories: ["File management", "Collaboration"],
  },
];

export function categoryCount(category: IntegrationCategory | "All"): number {
  if (category === "All") return CONNECT_INTEGRATIONS.length;
  return CONNECT_INTEGRATIONS.filter((i) => i.categories.includes(category)).length;
}
