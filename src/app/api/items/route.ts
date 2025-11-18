import {NextResponse} from "next/server";
import {Category, listItems} from "../../../../lib/RentalManagementSystem";

export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || undefined;
  const category = (searchParams.get("category") as Category) || undefined;
  const size = searchParams.get("size") || undefined;
  const color = searchParams.get("color") || undefined;
  const style = searchParams.get("style") || undefined;

  const items = listItems({ q, category, size, color, style }).map((i) => ({
    id: i.id,
    name: i.name,
    category: i.category,
    pricePerDay: i.pricePerDay,
    sizes: i.sizes,
    color: i.color,
    style: i.style,
    image: i.images[0],
    alt: i.alt,
  }));

  return NextResponse.json({ items });
}
