export interface ShareableRequest {
  blood_type_needed: string;
  area_label: string;
  patient_name: string;
  required_by: string;
  contact_phone: string;
}

export function generateShareText(request: ShareableRequest): string {
  const dateObj = new Date(request.required_by);
  const timeFormatted = isNaN(dateObj.getTime())
    ? request.required_by
    : dateObj.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

  const appUrl = window.location.origin;

  return `🩸 URGENT: ${request.blood_type_needed} blood needed at ${request.area_label}!
👤 Patient: ${request.patient_name}
⏰ Required by: ${timeFormatted}
📞 Contact: ${request.contact_phone}

Can you help? Contact them directly, or join BloodBridge to view more details: ${appUrl}`;
}

export function getWhatsAppLink(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function getXLink(text: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export function getFacebookLink(): string {
  const appUrl = window.location.origin;
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Clipboard copy failed", error);
    return false;
  }
}

export async function nativeShare(title: string, text: string): Promise<boolean> {
  try {
    if (navigator?.share) {
      await navigator.share({
        title,
        text,
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Native share failed", error);
    return false;
  }
}

