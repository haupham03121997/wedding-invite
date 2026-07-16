import Invite, { type GuestRec, type MyRsvp } from "@/components/Invite";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

/* Tra mã khách ngay trên server: HTML trả về đã có sẵn tên,
   không còn khoảng chờ fetch phía client sau hydrate */
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const to = typeof sp.to === "string" ? sp.to.trim() : "";

  let guestName = to.slice(0, 40);
  let guestRec: GuestRec | null = null;
  let myRsvp: MyRsvp | null = null;

  if (to) {
    const { data: g } = await supabase
      .from("guests")
      .select("id,name,side,hearts")
      .eq("code", to)
      .maybeSingle();
    if (g) {
      guestRec = g;
      guestName = g.name;
      const { data: r } = await supabase
        .from("rsvps")
        .select("name,side,count,vibe,wish")
        .eq("guest_id", g.id)
        .limit(1)
        .maybeSingle();
      myRsvp = r ?? null;
    }
  }

  return <Invite guestName={guestName} guestRec={guestRec} myRsvp={myRsvp} />;
}
