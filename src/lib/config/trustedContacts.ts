export interface TrustedContact {
  name: string;
  phone: string;
  role: string;
  isAdvisoryAgent?: boolean;
}

export const TRUSTED_CONTACTS: TrustedContact[] = [
  {
    name: "AI Advisory Agent",
    phone: "advisory-agent-id",
    role: "Market & Industrial Intelligence",
    isAdvisoryAgent: true
  },
  {
    name: "Factory Leadership",
    phone: "owner-phone-id",
    role: "Plant Manager",
    isAdvisoryAgent: false
  }
];

export function isTrustedAdvisorySender(senderName: string, phoneJid?: string): boolean {
  if (!senderName && !phoneJid) return false;
  const lowerName = (senderName || "").toLowerCase();
  const lowerJid = (phoneJid || "").toLowerCase();

  const nameMatch = lowerName.includes("advisory") || lowerName.includes("market agent");
  const phoneMatch = TRUSTED_CONTACTS.some(
    c => c.isAdvisoryAgent && (lowerJid.includes(c.phone) || lowerName.includes(c.name.toLowerCase()))
  );

  return Boolean(nameMatch || phoneMatch);
}
