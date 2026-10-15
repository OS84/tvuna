import { getContactConfig } from "../../../lib/contact-config";
import { handleContact } from "../../../lib/contact-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export function POST(request: Request) {
  return handleContact(request, getContactConfig());
}
