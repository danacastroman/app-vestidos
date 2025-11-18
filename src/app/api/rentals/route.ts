import { NextResponse } from "next/server";
import {createRental, isItemAvailable, getItem} from "../../../../lib/RentalManagementSystem";
import {verifyCsrfToken} from "../../../../lib/CsrfSessionManagement";

function normalizeDate(s: string | null) {
  if (!s) return null;
  const m = s.match(/^\d{4}-\d{2}-\d{2}$/);
  return m ? s : null;
}

export async function POST(req: Request) {
  const form = await req.formData();
  const csrf = form.get("csrf")?.toString() ?? null;
  if (!verifyCsrfToken(csrf)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 400 });
  }

  const itemId = Number(form.get("itemId") || NaN);
  const name = (form.get("name") || "").toString().trim();
  const email = (form.get("email") || "").toString().trim();
  const phone = (form.get("phone") || "").toString().trim();
  const start = normalizeDate((form.get("start") || "").toString());
  const end = normalizeDate((form.get("end") || "").toString());

  if (!itemId || !name || !email || !phone || !start || !end) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }

  const item = getItem(itemId);
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
  if (end < start) return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });

  if (!isItemAvailable(itemId, start, end)) {
    return NextResponse.json({ error: "Item not available for selected dates" }, { status: 409 });
  }

  const { error } = createRental({
    itemId,
    start,
    end,
    customer: { name, email, phone },
  });

  if (error) return NextResponse.json({ error }, { status: 409 });

  // Redirect back to item page with a success message
  const res = NextResponse.redirect(new URL(`/items/${itemId}?success=1`, req.url));
  return res;
}
