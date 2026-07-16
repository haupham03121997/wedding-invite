"use client";

import { COUPLE, WEDDING } from "@/lib/wedding";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

/* Vibe cho lời chúc + emoji thả nhanh vào ô lời chúc */
const VIBES: [string, string][] = [
  ["🎉", "Vui vẻ"],
  ["💝", "Ngọt ngào"],
  ["🥳", "Quẩy"],
  ["💸", "Giàu sang"],
];
const WISH_EMOJIS = ["❤️", "🥰", "💍", "🎊", "🍾", "😘"];
const HEART_EMOJIS = ["❤️", "💖", "💕", "😍"];
const GIFT_EMOJIS = ["💝", "🧧", "💰", "✨"];

/* Tông màu thiệp: màu sắc định nghĩa trong globals.css ([data-theme]),
   ở đây chỉ chọn ảnh bìa/ảnh cuối hợp không khí từng tông */
const THEMES = [
  { id: "moc", label: "Mộc mạc", cover: "/assets/cover.jpg", footer: "/assets/footer.jpg" },
  { id: "dodo", label: "Đỏ đô", cover: "/assets/gallery/IMG_3817.jpg", footer: "/assets/footer.jpg" },
  { id: "hong", label: "Hồng phấn", cover: "/assets/gallery/IMG_4365.jpg", footer: "/assets/gallery/IMG_4572.jpg" },
  { id: "reu", label: "Xanh rêu", cover: "/assets/gallery/IMG_4998.jpg", footer: "/assets/gallery/IMG_5274.jpg" },
  { id: "dem", label: "Xanh đêm", cover: "/assets/gallery/IMG_5304.jpg", footer: "/assets/gallery/IMG_5364.jpg" },
] as const;
type ThemeId = (typeof THEMES)[number]["id"];

type Wish = { id: number; name: string; vibe: string; wish: string | null };
const LANDSCAPE = new Set(["IMG_4185", "IMG_4412", "IMG_4703", "IMG_5140"]);
const GALLERY = [
  "IMG_3817", "IMG_3910", "IMG_3984", "IMG_4115", "IMG_4131", "IMG_4185",
  "IMG_4216", "IMG_4365", "IMG_4389", "IMG_4412", "IMG_4475", "IMG_4503",
  "IMG_4572", "IMG_4674", "IMG_4703", "IMG_4884", "IMG_4961", "IMG_4998",
  "IMG_5140", "IMG_5274", "IMG_5304", "IMG_5325", "IMG_5364", "IMG_5466",
].map((name, i) => ({
  src: `/assets/gallery/${name}.jpg`,
  alt: `Ảnh cưới ${COUPLE} ${i + 1}`,
  w: LANDSCAPE.has(name) ? 5857 : 3905,
  h: LANDSCAPE.has(name) ? 3905 : 5857,
}));
const GALLERY_PREVIEW = 6;

/* Chia gallery thành nhịp magazine: ảnh dọc gom vào cụm masonry 2 cột,
   gặp ảnh ngang thì cho tràn full chiều ngang làm khoảng thở.
   Giữ index gốc (gi) để lightbox mở đúng ảnh. */
type GalleryEntry = { img: (typeof GALLERY)[number]; gi: number };
const GALLERY_ROWS = (() => {
  const rows: ({ type: "chunk"; items: GalleryEntry[] } | ({ type: "wide" } & GalleryEntry))[] = [];
  let chunk: GalleryEntry[] = [];
  GALLERY.forEach((img, gi) => {
    if (img.w > img.h) {
      if (chunk.length) {
        rows.push({ type: "chunk", items: chunk });
        chunk = [];
      }
      rows.push({ type: "wide", img, gi });
    } else {
      chunk.push({ img, gi });
    }
  });
  if (chunk.length) rows.push({ type: "chunk", items: chunk });
  return rows;
})();

/* [left%, thời gian rơi s, nhịp đập s, delay rơi s, delay đập s, cỡ tim] */
const HEARTS: [number, number, number, number, number, number][] = [
  [5, 14, 1.2, 0, 0, 0.7],
  [15, 19, 1.6, 3, 0.2, 0.9],
  [28, 12, 1.0, 7, 0.5, 0.6],
  [38, 16, 1.4, 1, 0.1, 0.8],
  [48, 22, 1.8, 9, 0.4, 0.7],
  [58, 15, 1.1, 4, 0.3, 1.1],
  [68, 18, 1.5, 11, 0.6, 1.0],
  [78, 13, 1.3, 2, 0.2, 1.2],
  [88, 20, 1.7, 6, 0.7, 0.9],
  [95, 14, 1.2, 13, 0.1, 1.1],
  [10, 17, 1.4, 5, 0.3, 0.8],
  [22, 13, 1.1, 10, 0.5, 1.0],
  [33, 21, 1.6, 4, 0.2, 0.7],
  [43, 15, 1.3, 12, 0.6, 1.2],
  [52, 19, 1.5, 2, 0.1, 0.9],
  [63, 11, 0.9, 8, 0.4, 0.6],
  [73, 23, 1.9, 15, 0.7, 0.8],
  [83, 16, 1.2, 1, 0.3, 1.1],
  [90, 14, 1.4, 9, 0.5, 0.7],
  [6, 25, 2.0, 8, 0.2, 1.0],
];

/* Lịch tháng cưới: suy hết từ WEDDING.date để không lệch nhau */
const wd = WEDDING.date;
const CAL_PAD = (new Date(wd.getFullYear(), wd.getMonth(), 1).getDay() + 6) % 7; // offset thứ 2
const CAL_DAYS = new Date(wd.getFullYear(), wd.getMonth() + 1, 0).getDate();
const CAL_DAY = wd.getDate();
const CAL_WEEKDAY = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"][wd.getDay()];
const CAL_DM = `Ngày ${String(CAL_DAY).padStart(2, "0")} Tháng ${String(wd.getMonth() + 1).padStart(2, "0")}`;

/* Pháo tim khi gửi lời chúc: [left%, delay s, thời gian s, cỡ] — bung một lần rồi tan */
const BURST: [number, number, number, number][] = [
  [8, 0.05, 1.1, 0.7],
  [18, 0.3, 1.3, 1.0],
  [28, 0.0, 0.9, 0.6],
  [38, 0.45, 1.2, 1.2],
  [46, 0.15, 1.0, 0.8],
  [54, 0.55, 1.4, 0.7],
  [62, 0.1, 1.1, 1.1],
  [72, 0.4, 1.2, 0.9],
  [82, 0.2, 1.0, 1.2],
  [92, 0.5, 1.3, 0.8],
  [33, 0.65, 1.1, 0.6],
  [67, 0.7, 1.0, 0.7],
];

/* Pháo giấy lúc bóc thiệp: [dx, dy, delay s, thời gian s, % màu accent, góc xoay]
   bung tỏa cầu từ vị trí trái tim, nửa bay lên nửa rơi xuống */
const CONFETTI: [number, number, number, number, number, number][] = [
  [-175, -190, 0, 1.9, 95, 520], [162, -230, 0.05, 2.1, 70, -640],
  [-120, -300, 0.02, 2.3, 55, 430], [95, -150, 0.08, 1.7, 100, -380],
  [-60, -260, 0.1, 2.0, 80, 590], [140, -80, 0.03, 1.8, 60, -470],
  [-190, -40, 0.07, 2.2, 90, 350], [180, -320, 0.12, 2.4, 50, -560],
  [-40, -350, 0.04, 2.2, 75, 610], [30, -210, 0.09, 1.9, 88, -420],
  [-150, 120, 0.02, 2.0, 65, 480], [170, 180, 0.06, 2.3, 92, -530],
  [-90, 240, 0.1, 2.4, 58, 390], [120, 280, 0.03, 2.2, 78, -600],
  [-170, 300, 0.08, 2.5, 85, 450], [60, 330, 0.05, 2.3, 62, -490],
  [-30, 260, 0.11, 2.1, 96, 570], [190, 60, 0.04, 1.8, 72, -360],
  [-110, -120, 0.06, 1.9, 84, 500], [80, -280, 0.12, 2.2, 55, -450],
  [-200, 200, 0.09, 2.4, 68, 620], [150, 340, 0.07, 2.5, 90, -540],
  [10, -320, 0.03, 2.1, 76, 410], [-70, 310, 0.05, 2.3, 82, -580],
  [100, 140, 0.1, 2.0, 64, 460], [-160, -270, 0.08, 2.2, 94, -510],
  [40, 220, 0.02, 1.9, 58, 550], [-15, -180, 0.11, 1.8, 86, -400],
];

/* Mốc đếm ngược: ngày cưới + giờ làm lễ */
const [CD_H, CD_MIN] = WEDDING.ceremony.hour.split(":").map(Number);
const CD_TARGET = new Date(wd.getFullYear(), wd.getMonth(), wd.getDate(), CD_H, CD_MIN).getTime();

function Countdown({ onZero }: { onZero: () => void }) {
  /* null tới khi mount xong: server không biết giờ client, tránh lệch hydration */
  const [left, setLeft] = useState<number | null>(null);
  const done = left === 0;

  /* Đúng ngày cưới: pháo giấy bung một lần khi dòng chúc mừng vào tầm nhìn
     (đếm về 0 ngay trước mắt cũng trúng nhánh này vì lúc đó phần tử đang hiện) */
  const doneRef = useRef<HTMLParagraphElement>(null);
  const fired = useRef(false);

  useEffect(() => {
    const tick = () => setLeft(Math.max(0, CD_TARGET - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const el = doneRef.current;
    if (!done || !el || fired.current) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !fired.current) {
        fired.current = true;
        onZero();
        io.disconnect();
      }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [done, onZero]);

  if (done) {
    return (
      <p ref={doneRef} className="text-center font-display text-2xl italic">
        Ngày chung đôi đã tới 🎉
      </p>
    );
  }

  const cells: [number, string][] = left === null
    ? []
    : [
      [Math.floor(left / 86400000), "Ngày"],
      [Math.floor(left / 3600000) % 24, "Giờ"],
      [Math.floor(left / 60000) % 60, "Phút"],
      [Math.floor(left / 1000) % 60, "Giây"],
    ];

  return (
    <div className="grid min-h-20 grid-cols-4 gap-2">
      {cells.map(([n, label]) => (
        <div key={label} className="rounded-xl border border-line bg-field py-3 text-center">
          {/* key theo giá trị: chỉ ô vừa đổi số mới chạy cd-tick */}
          <p key={n} className="cd-tick font-display font-bold text-4xl leading-none text-accent">
            {String(n).padStart(2, "0")}
          </p>
          <p className="mt-1.5 text-xs tracking-widest text-muted uppercase">{label}</p>
        </div>
      ))}
    </div>
  );
}

/* Reveal on scroll */
function Reveal({
  children,
  className = "",
  delay = 0,
  effect = "reveal",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  effect?: "reveal" | "tile";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);


  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`${effect} ${inView ? `${effect}-in` : ""} ${className}`}
    >
      {children}
    </div>
  );
}

function HeartIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function Heading({ children }: { children: ReactNode }) {
  return (
    <div className="mb-8 text-center">
      <h2 className="font-display text-[2.25rem] leading-tight">{children}</h2>
      <div className="mx-auto mt-3 h-px w-10 bg-accent" />
    </div>
  );
}

export type GuestRec = { id: number; name: string; side: string; hearts: number };
export type MyRsvp = { name: string; side: string; count: number; vibe: string; wish: string | null };

export default function Invite({
  guestName,
  guestRec: initialGuestRec,
  myRsvp: initialMyRsvp,
}: {
  guestName: string;
  guestRec: GuestRec | null;
  myRsvp: MyRsvp | null;
}) {
  const [opened, setOpened] = useState(false);
  const [gateGone, setGateGone] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  /* đã RSVP từ trước (server tra ra) thì vào thẳng màn cảm ơn */
  const [sent, setSent] = useState(initialMyRsvp !== null);
  const [sending, setSending] = useState(false);
  const [wish, setWish] = useState("");
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [themeId, setThemeId] = useState<ThemeId>("moc");
  const audioRef = useRef<HTMLAudioElement>(null);
  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];

  /* Comment nổi kiểu livestream: bật mặc định, nhớ lựa chọn của khách */
  const [liveChat, setLiveChat] = useState(true);
  /* Link mời riêng: server đã tra ?to=MÃ sẵn (app/page.tsx) → tên hiện ngay
     từ HTML đầu tiên. Không khớp mã thì guestName là tên thường như cũ */
  const guest = guestName;
  const [guestRec, setGuestRec] = useState(initialGuestRec);
  const [myRsvp, setMyRsvp] = useState(initialMyRsvp);
  /* RSVP khôi phục từ server (khách quay lại) — không bắn pháo tim như vừa gửi */
  const restored = initialMyRsvp !== null;

  /* Khôi phục tùy chọn đã lưu, một lần sau hydrate.
     localStorage chỉ đọc được ở client nên không thể nằm trong state khởi tạo
     (server render sẽ lệch) — setState một lần trong effect ở đây là chủ đích. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (THEMES.some((t) => t.id === saved)) setThemeId(saved as ThemeId);
    if (localStorage.getItem("liveChat") === "off") setLiveChat(false);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const pickTheme = (id: ThemeId) => setThemeId(id);

  /* Đồng bộ theme ra DOM + localStorage khi đổi. Lần chạy đầu bỏ qua:
     data-theme đã được script trong layout đặt đúng trước khi vẽ, ghi đè sẽ chớp màu */
  const themeSynced = useRef(false);
  useEffect(() => {
    if (!themeSynced.current) {
      themeSynced.current = true;
      return;
    }
    document.documentElement.dataset.theme = themeId;
    localStorage.setItem("theme", themeId);
  }, [themeId]);

  const toggleLiveChat = () =>
    setLiveChat((v) => {
      localStorage.setItem("liveChat", v ? "off" : "on");
      return !v;
    });

  /* Pháo giấy: bung lúc bóc thiệp, và đúng ngày cưới thì bung ở khối đếm ngược */
  const [confetti, setConfetti] = useState(false);
  const confettiTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const fireConfetti = useCallback(() => {
    setConfetti(false);
    clearTimeout(confettiTimer.current);
    /* rAF: gỡ rồi gắn lại qua một frame để animation chạy lại từ đầu nếu bung lần nữa */
    requestAnimationFrame(() => setConfetti(true));
    confettiTimer.current = setTimeout(() => setConfetti(false), 2800);
  }, []);

  /* Thả tim / tặng quà: chạm là emoji bay lên từ đúng điểm chạm.
     Một emitter dùng chung cho nút thả tim, sao chép STK, emoji lời chúc, chọn vibe */
  type Float = { id: number; x: number; y: number; emoji: string; dx: number; dur: number; size: number };
  const floatId = useRef(0);
  const [floats, setFloats] = useState<Float[]>([]);
  const emitAt = (x: number, y: number, emojis: string[], count = 6) => {
    const batch = Array.from({ length: count }, () => ({
      id: floatId.current++,
      x,
      y,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      dx: (Math.random() - 0.5) * 90,
      dur: 1.1 + Math.random() * 0.7,
      size: 0.9 + Math.random() * 0.8,
    }));
    /* spam chạm thoải mái, giữ tối đa 60 particle trên màn */
    setFloats((f) => [...f, ...batch].slice(-60));
    setTimeout(() => setFloats((f) => f.filter((p) => !batch.includes(p))), 2000);
  };
  const emit = (e: React.MouseEvent, emojis: string[], count = 6) => {
    const r = e.currentTarget.getBoundingClientRect();
    /* bàn phím "click" không có tọa độ → bay từ tâm nút */
    emitAt(e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2, emojis, count);
  };

  /* Tiếng "pop" khi thả tim: WebAudio synth nên không cần file âm thanh.
     Cao độ nhích dần theo combo cho cảm giác dồn nhịp, chạm nhiều càng vui tai */
  const popCtx = useRef<AudioContext | null>(null);
  const pop = (step = 0) => {
    if (typeof AudioContext === "undefined") return;
    const ctx = (popCtx.current ??= new AudioContext());
    if (ctx.state === "suspended") ctx.resume();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const f = 520 * Math.min(2, 1 + step * 0.06);
    osc.frequency.setValueAtTime(f, t);
    osc.frequency.exponentialRampToValueAtTime(f * 2.2, t + 0.02);
    osc.frequency.exponentialRampToValueAtTime(f * 0.9, t + 0.12);
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.exponentialRampToValueAtTime(0.09, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.18);
  };

  /* Combo thả tim: chạm liên tiếp trong 0.9s thì số nhân lớn dần */
  const [combo, setCombo] = useState(0);
  const comboTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /* Tổng tim chung mọi khách, đồng bộ qua bảng hearts (id=1) trên Supabase.
     heartTotal = hiển thị (gồm tap chưa gửi); heartKnown = số server đã xác nhận.
     Chưa tạo bảng thì các lời gọi fail im lặng, nút thả tim vẫn chạy như cũ */
  const [heartTotal, setHeartTotal] = useState(0);
  const heartKnown = useRef(0);
  const heartPending = useRef(0);
  const heartInFlight = useRef(false);
  const heartFlushTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const heartBtnRef = useRef<HTMLButtonElement>(null);

  /* Gửi dồn: mỗi đợt tap chỉ tốn một request; giữ pending tới khi server trả lời
     để nhận diện echo realtime của chính mình (không tự thả tim trùng) */
  const flushHearts = () => {
    if (heartInFlight.current || !heartPending.current) return;
    heartInFlight.current = true;
    const n = heartPending.current;
    supabase
      /* khách có mã mời thì tim được ghi thêm vào sổ riêng (guests.hearts) */
      .rpc("give_hearts", { n, guest: guestRec?.id ?? null })
      .then(({ data }) => {
        heartInFlight.current = false;
        const d = data as { total: number; mine: number | null } | null;
        if (typeof d?.total !== "number") {
          /* bảng chưa tạo / mất mạng: bỏ số chưa gửi để không retry vô hạn */
          heartPending.current = 0;
          return;
        }
        heartPending.current -= n;
        heartKnown.current = Math.max(heartKnown.current, d.total);
        setHeartTotal(heartKnown.current + heartPending.current);
        /* sổ tim riêng lấy theo server: tự khớp cả tim thả từ phiên/máy khác */
        const mine = d.mine;
        if (typeof mine === "number")
          setGuestRec((g) => (g ? { ...g, hearts: mine + heartPending.current } : g));
        if (heartPending.current) flushHearts();
      });
  };

  useEffect(() => {
    supabase
      .from("hearts")
      .select("count")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        if (!data) return;
        heartKnown.current = data.count;
        setHeartTotal(data.count + heartPending.current);
      });
    const ch = supabase
      .channel("hearts")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "hearts" },
        (p) => {
          const next = (p.new as { count: number }).count;
          /* phần vượt quá (số đã biết + số mình chưa gửi) là tim của khách khác */
          const delta = next - heartKnown.current - heartPending.current;
          heartKnown.current = Math.max(heartKnown.current, next);
          setHeartTotal(heartKnown.current + heartPending.current);
          const r = heartBtnRef.current?.getBoundingClientRect();
          if (delta > 0 && r)
            emitAt(r.left + r.width / 2, r.top + r.height / 2, HEART_EMOJIS, Math.min(delta, 5));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const tapHeart = (e: React.MouseEvent) => {
    emit(e, HEART_EMOJIS, 7);
    pop(combo);
    setCombo((c) => c + 1);
    clearTimeout(comboTimer.current);
    comboTimer.current = setTimeout(() => setCombo(0), 900);
    /* cộng lạc quan ngay cho mượt, gửi dồn sau 1s ngơi tay */
    heartPending.current += 1;
    setHeartTotal(heartKnown.current + heartPending.current);
    /* sổ tim riêng của khách có mã mời cũng nhích theo từng chạm */
    setGuestRec((g) => (g ? { ...g, hearts: g.hearts + 1 } : g));
    clearTimeout(heartFlushTimer.current);
    heartFlushTimer.current = setTimeout(flushHearts, 1000);
  };

  /* Hộp mừng cưới: đánh dấu STK vừa sao chép để đổi nhãn nút trong 2s */
  const [copied, setCopied] = useState<string | null>(null);
  const copyAccount = (number: string) => {
    navigator.clipboard?.writeText(number).then(() => {
      setCopied(number);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  /* Sổ lưu bút đã hiện đủ lời chúc → comment nổi tự nhường chỗ, khỏi trùng đôi */
  const guestbookRef = useRef<HTMLElement>(null);
  const [guestbookInView, setGuestbookInView] = useState(false);
  const hasWishes = wishes.length > 0;
  useEffect(() => {
    const el = guestbookRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setGuestbookInView(entry.isIntersecting),
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasWishes]);

  /* Lightbox album: mở modal native, trượt tới đúng ảnh vừa chạm */
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [lbIndex, setLbIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const slidesRef = useRef<HTMLDivElement>(null);
  /* Mở lightbox bằng View Transition: ảnh nhỏ "bay" liền mạch vào khung lớn.
     Gắn tạm view-transition-name lên đúng thumbnail vừa chạm (tên phải duy nhất),
     morph xong thì gỡ. Trình duyệt cũ / giảm chuyển động → mở kiểu thường */
  const openLightbox = (i: number, e?: React.MouseEvent) => {
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { finished: Promise<void> };
    };
    const thumb = (e?.currentTarget as HTMLElement | undefined)?.querySelector("img");
    const open = () => {
      setLightbox(i);
      setLbIndex(i);
    };
    if (
      !doc.startViewTransition ||
      !thumb ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      open();
      return;
    }
    thumb.style.setProperty("view-transition-name", "lb-photo");
    doc.startViewTransition(() => {
      flushSync(open);
      /* gỡ tên NGAY sau khi mở: lúc chụp trạng thái mới, tên chỉ được phép
         nằm trên một phần tử — trùng tên là trình duyệt hủy luôn transition */
      thumb.style.removeProperty("view-transition-name");
    });
  };
  const sheetRef = useRef<HTMLDivElement>(null);
  /* layout effect thay effect thường: dialog phải mở xong TRONG flushSync
     của startViewTransition, để transition chụp đúng trạng thái cuối */
  useLayoutEffect(() => {
    const d = dialogRef.current;
    if (lightbox === null || !d) return;
    /* dọn dấu vết lần vuốt-đóng trước rồi mới mở */
    const sheet = sheetRef.current;
    if (sheet) {
      sheet.style.transform = "";
      sheet.style.opacity = "";
      sheet.style.transition = "";
    }
    d.style.backgroundColor = "";
    d.showModal();
    const s = slidesRef.current;
    if (s) s.scrollLeft = lightbox * s.clientWidth;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  /* Vuốt xuống để đóng lightbox: ảnh theo ngón tay, nền nhạt dần, thả đủ xa thì đóng.
     Chỉ nhận cử chỉ dọc rõ rệt để không giành với vuốt ngang chuyển ảnh */
  const lbDrag = useRef({ x0: 0, y0: 0, dy: 0, mode: "idle" as "idle" | "drag" | "scroll" });

  /* Double-tap ảnh → tim lớn nảy lên tại điểm chạm, kiểu Instagram.
     dialog nằm top-layer nên tim phải vẽ bên trong sheet, tọa độ đổi về gốc sheet */
  const [lbHeart, setLbHeart] = useState<{ id: number; x: number; y: number } | null>(null);
  const lbLastTap = useRef(0);
  const popLbHeart = (cx: number, cy: number) => {
    const r = sheetRef.current?.getBoundingClientRect();
    const id = ++floatId.current;
    setLbHeart({ id, x: cx - (r?.left ?? 0), y: cy - (r?.top ?? 0) });
    setTimeout(() => setLbHeart((h) => (h?.id === id ? null : h)), 950);
  };

  const onLbTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    lbDrag.current = { x0: t.clientX, y0: t.clientY, dy: 0, mode: "idle" };
    const now = performance.now();
    if (now - lbLastTap.current < 300) popLbHeart(t.clientX, t.clientY);
    lbLastTap.current = now;
  };
  const onLbTouchMove = (e: React.TouchEvent) => {
    const d = lbDrag.current;
    const t = e.touches[0];
    const dx = t.clientX - d.x0;
    const dy = t.clientY - d.y0;
    if (d.mode === "idle") {
      if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx) * 1.2) d.mode = "drag";
      else if (Math.abs(dx) > 12) d.mode = "scroll";
    }
    if (d.mode !== "drag") return;
    d.dy = Math.max(0, dy);
    const sheet = sheetRef.current;
    const dlg = dialogRef.current;
    if (sheet) sheet.style.transform = `translateY(${d.dy}px)`;
    if (dlg)
      dlg.style.backgroundColor = `rgb(20 16 14 / ${0.95 * (1 - Math.min(1, d.dy / 500))})`;
  };
  const onLbTouchEnd = () => {
    const d = lbDrag.current;
    const sheet = sheetRef.current;
    const dlg = dialogRef.current;
    if (d.mode === "drag" && d.dy > 100) {
      /* trượt nốt xuống rồi mới đóng cho liền mạch */
      if (sheet) {
        sheet.style.transition = "transform 180ms var(--ease), opacity 180ms var(--ease)";
        sheet.style.transform = "translateY(70vh)";
        sheet.style.opacity = "0";
      }
      if (dlg) dlg.style.backgroundColor = "rgb(20 16 14 / 0)";
      setTimeout(() => dialogRef.current?.close(), 180);
    } else {
      if (sheet) {
        sheet.style.transition = "transform 200ms var(--ease)";
        sheet.style.transform = "";
        setTimeout(() => {
          if (sheet) sheet.style.transition = "";
        }, 220);
      }
      if (dlg) dlg.style.backgroundColor = "";
    }
    d.mode = "idle";
    d.dy = 0;
  };

  /* Tải sổ lưu bút: chỉ lấy các dòng có lời chúc, mới nhất trước */
  useEffect(() => {
    supabase
      .from("rsvps")
      .select("id,name,vibe,wish")
      .not("wish", "is", null)
      .neq("wish", "")
      .order("id", { ascending: false })
      .limit(30)
      .then(({ data }) => setWishes(data ?? []));
  }, []);

  /* Lock scroll while the gate is closed */
  useEffect(() => {
    document.body.style.overflow = gateGone ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [gateGone]);

  /* Fade âm lượng bằng rAF cho nhạc vào/ra mềm.
     ponytail: iOS Safari khóa audio.volume nên fade tự vô hiệu ở đó, play/pause vẫn chạy bình thường */
  const fadeRaf = useRef(0);
  const fadeTo = (target: number, ms: number, done?: () => void) => {
    const audio = audioRef.current;
    if (!audio) return;
    cancelAnimationFrame(fadeRaf.current);
    const from = audio.volume;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      audio.volume = from + (target - from) * k;
      if (k < 1) fadeRaf.current = requestAnimationFrame(step);
      else done?.();
    };
    fadeRaf.current = requestAnimationFrame(step);
  };

  const openInvite = () => {
    /* Reload giữa trang: trình duyệt khôi phục vị trí scroll cũ, kéo về đầu trước khi mở */
    window.scrollTo(0, 0);
    setOpened(true);
    fireConfetti();
    const audio = audioRef.current;
    if (audio) audio.volume = 0;
    audio
      ?.play()
      .then(() => {
        setPlaying(true);
        fadeTo(1, 2000);
      })
      .catch(() => { });
    setTimeout(() => setGateGone(true), 1300);
  };

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => {
        setPlaying(true);
        fadeTo(1, 800);
      }).catch(() => { });
    } else {
      /* đĩa dừng quay ngay cho phản hồi tức thì, nhạc lịm dần rồi mới pause hẳn */
      setPlaying(false);
      fadeTo(0, 500, () => audio.pause());
    }
  };

  const submitRsvp = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    const f = new FormData(e.currentTarget);
    const payload = {
      name: String(f.get("name") ?? ""),
      side: String(f.get("side") ?? ""),
      count: Number(f.get("count")),
      vibe: String(f.get("vibe") ?? ""),
      wish: String(f.get("wish") ?? ""),
    };
    const { data, error } = await supabase
      .from("rsvps")
      .insert({ ...payload, guest_id: guestRec?.id ?? null })
      .select("id,name,vibe,wish")
      .single();
    setSending(false);
    if (error) {
      alert("Gửi không thành công, bạn thử lại nhé!");
      return;
    }
    /* Lời chúc vừa gửi hiện ngay đầu sổ lưu bút */
    if (data?.wish) setWishes((w) => [data, ...w]);
    setMyRsvp(payload);
    setSent(true);
  };

  return (
    /* overflow-clip thay hidden: vẫn cắt phần tràn nhưng không thành scroll container,
       để animation-timeline: view() của ảnh parallax bám đúng scroll của trang */
    <main className="overflow-clip">
      <audio ref={audioRef} src="/wedding-music.m4a" loop preload="auto" />

      {/* ===== Màn hình chào: bóc thiệp ===== */}
      {!gateGone && (
        <div
          className="fixed inset-x-0 top-0 z-50 mx-auto h-dvh max-w-107.5"
          aria-label="Màn hình chào"
        >
          {/* Hai nửa phong bì: dấu sáp vỡ trước, phong bì tách sau (delay 250ms).
              Ảnh nền mờ nằm TRONG từng nửa để khi tách đôi, mỗi nửa mang theo nửa ảnh */}
          <div
            className={`absolute inset-x-0 top-0 h-[calc(50%+1px)] overflow-hidden bg-[#bcbcbc] transition-transform delay-250 duration-900 ease-(--ease) ${opened ? "-translate-y-full" : ""
              }`}
          >
            <span className="absolute inset-x-0 top-0 h-dvh bg-[url(/assets/story-2.jpg)] bg-cover bg-center opacity-20" />
          </div>
          <div
            className={`absolute inset-x-0 bottom-0 h-1/2 overflow-hidden bg-[#bcbcbc] transition-transform delay-250 duration-900 ease-(--ease) ${opened ? "translate-y-full" : ""
              }`}
          >
            <span className="absolute inset-x-0 bottom-0 h-dvh bg-[url(/assets/story-2.jpg)] bg-cover bg-center opacity-20" />
          </div>
          {/* Mưa trái tim mờ ảo rơi sau lời chào */}
          <div
            className={`pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-300 ${opened ? "opacity-0" : ""
              }`}
            aria-hidden="true"
          >
            {HEARTS.map(([left, fall, beat, delay, beatDelay, scale], i) => (
              <span
                key={i}
                className="fall-heart"
                style={{
                  left: `${left}%`,
                  animationDuration: `${fall}s, ${beat}s`,
                  animationDelay: `${delay}s, ${beatDelay}s`,
                  ["--s" as string]: scale,
                }}
              />
            ))}
          </div>
          {/* Nội dung lời chào */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center px-8 pb-10 text-center transition-opacity duration-300 ${opened ? "opacity-0" : ""
              }`}
          >
            {/* intro chạy bằng CSS animation thuần, không phụ thuộc JS */}
            <div className="intro-rise mt-6 w-full rounded-md border border-line bg-white/50 px-4 py-6">
              <p className="text-sm tracking-[0.25em] mb-3 text-muted uppercase">
                Thiệp mời lễ cưới
              </p>
              <p className="mt-2 font-display text-3xl font-bold flex items-center flex-col justify-center gap-1 whitespace-nowrap">
                {/* tên cô dâu chú rể hiện dần từ mờ nhòe sang rõ nét, so le nhau */}
                <span className="intro-blur [animation-delay:0.6s]">{WEDDING.groom}</span>
                <Image
                  src="/heart.webp"
                  alt=""
                  width={56}
                  height={56}
                  className="intro-pop"
                />
                <span className="intro-blur [animation-delay:1s]">{WEDDING.bride}</span>
              </p>
              <p className="mt-2 font-display text-2xl font-bold text-muted italic">
                {WEDDING.dateDisplay}
              </p>
              {/* Link mời riêng: đề tên khách như thiệp viết tay */}
              {guest && (
                <p className="handwrite mt-4 font-script text-2xl text-accent">
                  Thân mời <span className='font-semibold'>{guest}</span>
                </p>
              )}

              {/* Trái tim đập: chạm để bóc thiệp */}
              <button
                type="button"
                onClick={openInvite}
                aria-label="Bóc thiệp cưới"
                className="group mt-5 inline-flex flex-col items-center"
              >
                <span
                  className={`relative block h-24 w-24 transition-all duration-500 ease-(--ease) ${opened ? "scale-150 opacity-0" : ""
                    }`}
                >
                  {/* bóng tim lan tỏa sau mỗi nhịp đập */}
                  <HeartIcon className="heart-echo absolute inset-0 h-full w-full text-accent" />
                  <span className="heartbeat absolute inset-0 block">
                    <HeartIcon className="h-full w-full text-accent filter-[drop-shadow(0_4px_12px_var(--accent-glow))]" />
                    <span className="absolute inset-x-0 top-[30%] font-display text-xl text-paper italic">
                      {WEDDING.initials[0]}
                      <span className="mx-0.5 text-lg">&</span>
                      {WEDDING.initials[1]}
                    </span>
                  </span>
                </span>
                <span
                  className={`mt-3 text-sm font-medium tracking-wide text-accent transition-opacity duration-300 ${opened ? "opacity-0" : ""
                    }`}
                >
                  Bóc thiệp cưới
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Pháo giấy bung qua khe phong bì đang tách ===== */}
      {confetti && (
        <div
          className="pointer-events-none fixed inset-x-0 top-0 z-50 mx-auto h-dvh max-w-107.5 overflow-hidden"
          aria-hidden="true"
        >
          {CONFETTI.map(([dx, dy, delay, dur, mix, rz], i) => (
            <span
              key={i}
              className="confetti-bit"
              style={{
                width: 6 + (i % 3),
                height: 10 + (i % 4),
                background: `color-mix(in srgb, var(--accent) ${mix}%, var(--paper))`,
                animationDelay: `${delay}s`,
                animationDuration: `${dur}s`,
                ["--dx" as string]: dx,
                ["--dy" as string]: dy,
                ["--rz" as string]: rz,
              }}
            />
          ))}
        </div>
      )}

      {/* ===== Nút nhạc đĩa quay ===== */}
      {gateGone && (
        <button
          type="button"
          onClick={toggleMusic}
          aria-label={playing ? "Tắt nhạc nền" : "Bật nhạc nền"}
          aria-pressed={playing}
          className="fixed right-4 bottom-4 z-40 h-12 w-12 rounded-full shadow-[0_2px_8px_rgba(44,39,36,0.25)] min-[430px]:right-[calc(50%-199px)]"
        >
          <span
            className={`block h-full w-full rounded-full spin ${playing ? "" : "spin-paused"
              }`}
            style={{
              background:
                "radial-gradient(circle, var(--accent) 0 8px, var(--paper) 8px 9px, #2c2724 9px 11px, #3a332e 11px 13px, #2c2724 13px 15px, #3a332e 15px 17px, #2c2724 17px)",
            }}
          />
          {!playing && (
            <span className="absolute top-1/2 left-1/2 h-10 w-px -translate-x-1/2 -translate-y-1/2 rotate-45 bg-paper" />
          )}
        </button>
      )}

      {/* ===== Chọn tông màu thiệp: cột dọc ngay trên nút nhạc (bottom-4 + h-12 → bottom-18) ===== */}
      {gateGone && (
        <fieldset className="fixed right-4 bottom-18 z-40 rounded-full border border-paper/50 bg-paper/25 px-1 py-1.5 shadow-[0_2px_12px_rgba(44,39,36,0.12)] backdrop-blur-md min-[430px]:right-[calc(50%-199px)]">
          <legend className="sr-only">Chọn tông màu thiệp</legend>
          <div className="flex flex-col items-center gap-1">
            {THEMES.map((t) => (
              <label
                key={t.id}
                title={t.label}
                /* data-theme trên chính swatch: kéo đúng --accent của tông đó từ CSS, khỏi lặp mã màu */
                data-theme={t.id}
                className="cursor-pointer rounded-full p-1.5 has-focus-visible:ring-2 has-focus-visible:ring-accent/40"
              >
                <input
                  type="radio"
                  name="theme"
                  value={t.id}
                  checked={themeId === t.id}
                  onChange={() => pickTheme(t.id)}
                  className="sr-only"
                />
                <span
                  className={`block h-4 w-4 rounded-full bg-accent transition-transform duration-200 ease-(--ease) ${themeId === t.id
                    ? "scale-115 ring-2 ring-paper"
                    : "hover:scale-110"
                    }`}
                />
                <span className="sr-only">{t.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {/* ===== Comment nổi kiểu livestream: trôi lên, mờ dần ở mép trên,
             pointer-events-none nên không cản chạm/cuộn ===== */}
      {gateGone && wishes.length >= 3 && (
        <div
          aria-hidden="true"
          className={`live-chat-overlay pointer-events-none fixed bottom-20 left-3 z-30 h-72 w-[72%] max-w-80 overflow-hidden mask-[linear-gradient(to_bottom,transparent,black_35%)] transition-opacity duration-300 min-[430px]:left-[calc(50%-203px)] ${liveChat && !guestbookInView ? "opacity-100" : "opacity-0"
            }`}
        >
          <div
            className="chat-scroll"
            style={{ ["--dur" as string]: `${wishes.length * 5}s` }}
          >
            {[0, 1].map((copy) => (
              <div key={copy} className="flex flex-col items-start gap-2 pb-2">
                {wishes.map((w) => (
                  <p
                    key={`${copy}-${w.id}`}
                    className="max-w-full rounded-2xl bg-accent/75 px-3.5 py-1.5 text-sm leading-relaxed text-paper backdrop-blur-sm"
                  >
                    <span className="font-semibold">{w.name}</span>: {w.vibe} {w.wish}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nút bật/tắt comment nổi */}
      {gateGone && wishes.length >= 3 && (
        <button
          type="button"
          onClick={toggleLiveChat}
          aria-pressed={liveChat}
          aria-label={liveChat ? "Ẩn lời chúc nổi" : "Hiện lời chúc nổi"}
          /* ở sổ lưu bút overlay bị ép ẩn, nút bấm không có tác dụng nhìn thấy → ẩn nút theo luôn */
          className={`fixed bottom-4 left-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-paper/50 bg-paper/25 text-ink shadow-[0_2px_12px_rgba(44,39,36,0.12)] backdrop-blur-md transition-opacity duration-300 min-[430px]:left-[calc(50%-199px)] ${guestbookInView ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-5 w-5"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-8.4 8.4c-1.2 0-2.35-.25-3.4-.7L3 21l1.8-5.2a8.4 8.4 0 1 1 16.2-4.3z" />
            {!liveChat && <line x1="4" y1="20" x2="20" y2="4" />}
          </svg>
        </button>
      )}

      {/* ===== Nút thả tim: chạm liên tục cho tim bay như livestream ===== */}
      {gateGone && (
        <button
          ref={heartBtnRef}
          type="button"
          onClick={tapHeart}
          aria-label="Thả tim"
          className="fixed bottom-16 left-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-paper/50 bg-paper/25 text-accent shadow-[0_2px_12px_rgba(44,39,36,0.12)] backdrop-blur-md min-[430px]:left-[calc(50%-199px)]"
        >
          <HeartIcon className="h-5 w-5" />
          {/* tổng tim cả trang, mọi khách cùng thấy */}
          {heartTotal > 0 && (
            <span className="pointer-events-none absolute -top-2 -right-2.5 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold leading-none text-paper">
              {new Intl.NumberFormat("vi", { notation: "compact" }).format(heartTotal)}
            </span>
          )}
        </button>
      )}

      {/* Sổ tim riêng của khách có mã mời: tim nhỏ + con số, không câu chữ rườm rà */}
      {gateGone && guestRec && guestRec.hearts > 0 && (
        <p
          aria-label={`Bạn đã thả ${guestRec.hearts} tim`}
          className="pointer-events-none fixed bottom-17.5 left-16 z-40 flex h-7 items-center gap-1 rounded-full border border-paper/50 bg-paper/25 px-2.5 shadow-[0_2px_12px_rgba(44,39,36,0.12)] backdrop-blur-md min-[430px]:left-[calc(50%-151px)]"
        >
          <HeartIcon aria-hidden="true" className="h-3 w-3 text-accent" />
          <span
            key={guestRec.hearts}
            className="cd-tick font-display text-sm font-semibold leading-none text-accent"
          >
            {new Intl.NumberFormat("vi").format(guestRec.hearts)}
          </span>
        </p>
      )}

      {/* Số combo hiện từ lần chạm thứ 2, nảy theo mỗi lần chạm và lớn dần */}
      {combo > 1 && (
        <p
          key={combo}
          aria-hidden="true"
          className="combo-pop pointer-events-none fixed bottom-27 left-4 z-40 w-10 text-center font-display font-bold text-accent [text-shadow:0_1px_10px_var(--paper)] min-[430px]:left-[calc(50%-199px)]"
          style={{ fontSize: `${Math.min(1.375 + combo * 0.055, 2.5)}rem` }}
        >
          ×{combo}
        </p>
      )}

      {/* ===== Emoji bay lên từ điểm chạm (thả tim / tặng quà / lời chúc) ===== */}
      {floats.length > 0 && (
        <div className="pointer-events-none fixed inset-0 z-50" aria-hidden="true">
          {floats.map((p) => (
            <span
              key={p.id}
              className="float-up"
              style={{
                left: p.x,
                top: p.y,
                fontSize: `${p.size * 1.375}rem`,
                animationDuration: `${p.dur}s`,
                ["--dx" as string]: p.dx,
              }}
            >
              {p.emoji}
            </span>
          ))}
        </div>
      )}

      {/* ===== Trang bìa ===== */}
      <section className="relative flex h-dvh items-end overflow-hidden">
        <Image
          key={theme.cover}
          src={theme.cover}
          alt={`${COUPLE} trong trang phục cưới`}
          fill
          priority
          sizes="430px"
          className={`object-cover object-top ${opened ? "kenburns" : ""}`}
        />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-(--shade)/75 to-transparent" />
        {/* dải sương mờ: ảnh blur dần về mép dưới rồi tan vào màu giấy của section kế tiếp
            (nằm trước khối chữ trong DOM nên chữ vẫn sắc nét) */}
        <div className="absolute inset-x-0 bottom-0 h-40 backdrop-blur-[6px] mask-[linear-gradient(to_top,black_25%,transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-paper via-paper/45 to-transparent" />
        <div className="relative w-full px-8 pb-16 text-paper">
          {opened && (
            <>
              <p className="rise text-sm tracking-[0.3em] uppercase" style={{ animationDelay: "300ms" }}>
                Save the date
              </p>
              <h1
                className="rise mt-3 font-display text-[3.25rem] leading-[1.15]"
                style={{ animationDelay: "450ms" }}
              >
                {/* {" "} bắt buộc: JSX xoá khoảng trắng giữa các span, mất điểm xuống dòng */}
                <span className="whitespace-nowrap">{WEDDING.groom}</span>{" "}
                <br />
                <p className="text-[2.25rem] italic">&</p>{" "}
                <span className="whitespace-nowrap">{WEDDING.bride}</span>
              </h1>
              <p className="rise mt-3 text-[17px] text-paper/85" style={{ animationDelay: "650ms" }}>
                {WEDDING.dateFull}
              </p>
            </>
          )}
        </div>
      </section>

      {/* ===== Lời ngỏ ===== */}
      <section className="px-8 py-12 text-center">
        <Reveal>
          {/* Shelia chỉ có weight Regular: không đặt font-medium kẻo browser bôi đậm giả, hỏng nét thư pháp */}
          <p className="font-script text-2xl leading-normal text-accent">
            &ldquo;Yêu nhau mấy núi cũng trèo, ngày vui của chúng mình chỉ thiếu mỗi bạn.&rdquo;
          </p>
          {/* <p className="mt-6 text-[17px] leading-relaxed text-muted">
            Chúng mình cưới! Sự hiện diện của bạn là niềm vinh hạnh lớn nhất
            đối với gia đình hai bên.
          </p> */}
        </Reveal>
      </section>

      {/* ===== Thông tin cô dâu chú rể: hai họ đối xứng ===== */}
      <div className="mb-6 mt-2 flex items-center gap-3">
        <span className="h-px flex-1 bg-linear-to-l from-accent/40 to-transparent" />
        <p className="text-xs tracking-[0.3em] text-accent uppercase">LỜI CHÀO</p>
        <span className="h-px flex-1 bg-linear-to-r from-accent/40 to-transparent" />
      </div>
      <section className="px-6 pb-16">
        <div className="grid grid-cols-2 gap-x-4">
          <Reveal className="text-center">
            <p className="text-xs font-medium tracking-[0.3em] text-accent uppercase">
              Nhà trai
            </p>
            {/* min-h giữ hai cột thẳng hàng khi số dòng tên bố mẹ lệch nhau */}
            <div className="mt-2 min-h-10 space-y-0.5">
              {WEDDING.groomFamily.map((name) => (
                <p key={name} className="text-sm leading-5">{name}</p>
              ))}
            </div>
            <p className="mt-4 text-xs tracking-[0.25em] text-muted uppercase">Chú rể</p>
            <p className="mt-1.5 font-script text-3xl whitespace-nowrap">{WEDDING.groom}</p>
            <figure className="relative mt-5 aspect-3/4 overflow-hidden rounded-xl">
              <Image
                src="/assets/gallery/IMG_5364.jpg"
                alt={`Chú rể ${WEDDING.groom}`}
                fill
                sizes="360px"
                /* ảnh gốc full-body: zoom bán thân, origin 30% để đỉnh đầu ngang với ảnh cô dâu */
                className="origin-[50%_30%] scale-160 object-cover object-top"
              />
            </figure>
          </Reveal>

          <Reveal className="text-center" delay={120}>
            <p className="text-xs font-medium tracking-[0.3em] text-accent uppercase">
              Nhà gái
            </p>
            <div className="mt-2 min-h-10 space-y-0.5">
              {WEDDING.brideFamily.map((name) => (
                <p key={name} className="text-sm leading-5">{name}</p>
              ))}
            </div>
            <p className="mt-4 text-xs tracking-[0.25em] text-muted uppercase">Cô dâu</p>
            <p className="mt-1.5 font-script text-3xl whitespace-nowrap">{WEDDING.bride}</p>
            <figure className="relative mt-5 aspect-3/4 overflow-hidden rounded-xl">
              <Image
                src="/assets/gallery/IMG_4961.jpg"
                alt={`Cô dâu ${WEDDING.bride}`}
                fill
                sizes="180px"
                className="object-cover object-top"
              />
            </figure>
          </Reveal>
        </div>
      </section>

      {/* ===== Thiệp mời: 3 ảnh + giờ lễ + lịch + đếm ngược ===== */}
      <section className="px-6 pb-16">
        <Reveal>
          <Heading>Trân trọng kính mời</Heading>
        </Reveal>

        {/* 3 ảnh so le: chú rể — cặp đôi — cô dâu, hai bên hạ thấp cho nhịp điệu */}
        <Reveal>
          <div className="grid grid-cols-3 items-start gap-2">
            <figure className="relative mt-8 aspect-3/4 overflow-hidden rounded-xl">
              <Image
                src="/assets/gallery/IMG_4998.jpg"
                alt={`${COUPLE} sánh bước bên nhau`}
                fill
                sizes="140px"
                className="object-cover object-top"
              />
            </figure>
            <figure className="relative aspect-3/4 overflow-hidden rounded-xl">
              <Image
                src="/assets/gallery/IMG_5274.jpg"
                alt={`${COUPLE} ngoắc tay hẹn ước`}
                fill
                sizes="140px"
                className="object-cover object-top"
              />
            </figure>
            <figure className="relative mt-8 aspect-3/4 overflow-hidden rounded-xl">
              <Image
                src="/assets/gallery/IMG_5304.jpg"
                alt={`${COUPLE} trao nhau ánh nhìn`}
                fill
                sizes="140px"
                className="object-cover object-top"
              />
            </figure>
          </div>
        </Reveal>

        {/* Lời mời + giờ lễ chia 3 cột kiểu thiệp in */}
        <Reveal className="mt-12 text-center">
          <p className="text-sm tracking-[0.3em] text-muted uppercase">
            Tham gia tiệc mừng
          </p>
          <p className="mt-3 font-script text-5xl text-accent">Vu Quy</p>

          <div className="mx-auto mt-8 grid max-w-90 grid-cols-[1fr_auto_1fr] items-center">
            <p className="font-display font-semibold text-3xl text-accent">{WEDDING.ceremony.hour}</p>
            <div className="border-x border-accent/30 px-5 py-1.5">
              <p className="text-xs tracking-[0.25em] whitespace-nowrap text-muted uppercase">
                {CAL_WEEKDAY}
              </p>
              <p className="mt-1 font-display text-2xl whitespace-nowrap">{CAL_DM}</p>
            </div>
            <p className="font-display text-3xl font-semibold text-accent">{wd.getFullYear()}</p>
          </div>
        </Reveal>

        {/* Lịch tháng cưới */}
        <Reveal className="mt-12">

          <div className="mt-5 grid grid-cols-7 gap-y-2 text-center text-sm">
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
              <span key={d} className={d === "CN" ? "font-medium text-accent" : "text-muted"}>
                {d}
              </span>
            ))}
            {Array.from({ length: CAL_PAD }).map((_, i) => (
              <span key={`pad-${i}`} />
            ))}
            {Array.from({ length: CAL_DAYS }, (_, i) => i + 1).map((day) =>
              day === CAL_DAY ? (
                /* Ngày cưới: trái tim tự vẽ nét → tô màu → đập nhịp, chạy khi lịch cuộn vào tầm nhìn */
                <span key={day} className="flex justify-center">
                  <span className="relative -my-1 h-12 w-12">
                    <HeartIcon className="cal-heart-echo absolute inset-0 h-full w-full text-accent" />
                    <span className="cal-heart-beat absolute inset-0 block">
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="h-full w-full text-accent filter-[drop-shadow(0_3px_8px_var(--accent-glow))]"
                      >
                        <path
                          pathLength={1}
                          className="cal-heart-path"
                          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                        />
                      </svg>
                      <span className="cal-heart-day absolute inset-0 flex items-center justify-center pb-1.5 text-sm font-bold text-paper">
                        {day}
                      </span>
                    </span>
                  </span>
                </span>
              ) : (
                <span key={day} className="inline-flex h-8 text-accent/80  text-sm items-center justify-center">
                  {day}
                </span>
              )
            )}
          </div>
        </Reveal>

        {/* Đếm ngược */}
        <Reveal className="mt-2">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-linear-to-l from-accent/40 to-transparent" />
            <p className="text-xs tracking-[0.3em] text-accent uppercase">Đếm ngược</p>
            <span className="h-px flex-1 bg-linear-to-r from-accent/40 to-transparent" />
          </div>
          <Countdown onZero={fireConfetti} />
        </Reveal>
      </section>

      {/* ===== Câu chuyện ===== */}
      <section className="px-6 pt-4 pb-16">
        <Reveal>
          <Heading>Chuyện chúng mình</Heading>
        </Reveal>

        <div className="space-y-14">
          <Reveal>
            <figure className="relative aspect-4/5 overflow-clip rounded-xl">
              <Image
                src="/assets/story-1.jpg"
                alt="Hai đứa trong bộ cổ phục ngày dạm ngõ"
                fill
                sizes="430px"
                className="parallax object-cover"
              />
            </figure>
            <h3 className="mt-5 font-display text-[1.75rem]">Ngày mình gặp nhau</h3>
            <p className="mt-2 text-base leading-relaxed text-muted">
              Một lần tình cờ chạm mặt, rồi chẳng hiểu sao cứ muốn gặp lại
              thêm nhiều lần nữa.
            </p>
          </Reveal>

          <Reveal className="ml-10">
            <figure className="relative aspect-4/5 overflow-clip rounded-xl">
              <Image
                src="/assets/story-2.jpg"
                alt="Hai đứa cười tươi trong bộ đồ cưới màu kem"
                fill
                sizes="390px"
                className="parallax object-cover"
              />
            </figure>
            <h3 className="mt-5 font-display text-[1.75rem]">Những năm tháng bên nhau</h3>
            <p className="mt-2 text-base leading-relaxed text-muted">
              Từ những buổi hẹn vụng về đến lúc hiểu nhau chỉ qua một ánh mắt.
            </p>
          </Reveal>

          <Reveal className="mr-10">
            <figure className="relative aspect-4/5 overflow-clip rounded-xl">
              <Image
                src="/assets/story-3.jpg"
                alt="Hai đứa tung pháo giấy mừng ngày chung đôi"
                fill
                sizes="390px"
                className="parallax object-cover"
              />
            </figure>
            <h3 className="mt-5 font-display text-[1.75rem]">Về chung một nhà</h3>
            <p className="mt-2 text-base leading-relaxed text-muted">
              Và mùa thu năm nay, chúng mình chính thức gọi nhau là gia đình.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ===== Chi tiết hôn lễ ===== */}
      <section className="bg-alt px-8 py-16">
        <Reveal>
          <Heading>Hôn lễ</Heading>
        </Reveal>

        {/* Khung thiệp cổ điển: viền kép, giờ + ngày là tâm điểm */}
        <Reveal>
          <div className="rounded-2xl border border-accent/35 bg-field p-1.5 shadow-[0_2px_10px_rgba(44,39,36,0.07)]">
            <div className="rounded-[10px] border border-accent/20 px-6 py-8 text-center">
              <p className="text-xs font-medium tracking-[0.3em] text-muted uppercase">
                Thông tin hôn lễ
              </p>
              <h3 className="mt-3 font-display text-4xl">{WEDDING.ceremony.title}</h3>
              <p className="mt-2 text-base text-muted">
                {WEDDING.ceremony.side}:{" "}
                <span className="font-medium text-ink">{WEDDING.ceremony.hosts}</span>
              </p>

              <div className="mt-7 flex items-center gap-3">
                <span className="h-px flex-1 bg-linear-to-l from-accent/40 to-transparent" />
                <p className="text-xs tracking-[0.3em] text-accent uppercase">Vào lúc</p>
                <span className="h-px flex-1 bg-linear-to-r from-accent/40 to-transparent" />
              </div>
              <p className="mt-4 font-display text-[3.25rem] leading-none text-accent">
                {WEDDING.ceremony.hour}
              </p>
              <p className="mt-3 font-display text-xl italic">{WEDDING.dateFull}</p>

              <p className="mt-6 text-base font-medium">{WEDDING.ceremony.venue}</p>
              <p className="mt-1 text-base leading-relaxed text-muted">
                {WEDDING.ceremony.address}
              </p>
            </div>
          </div>
        </Reveal>

        {/* <div className="mx-auto my-10 h-px w-full bg-line" /> */}

        {/* <Reveal>
          <div className="text-center">
            <h3 className="font-display text-[1.75rem]">Lễ Thành Hôn</h3>
            <p className="mt-1 text-sm text-muted">Nhà trai</p>
            <p className="mt-4 text-base leading-relaxed">
              Nhà trai: Ông Phạm Dân và Bà Lê Thị Hiền
            </p>
            <p className="mt-1 text-base">11:00, Chủ Nhật ngày 02.08.2026</p>
            <p className="mt-1 text-base text-muted">
              Tư gia nhà trai, Khánh Cường, Đức Phổ, Quảng Ngãi
            </p>
          </div>
        </Reveal> */}

        <Reveal className="mt-8">
          <iframe
            src={WEDDING.mapsEmbed}
            title="Bản đồ đến địa điểm hôn lễ"
            /* nền + viền giữ chỗ khi bản đồ chưa tải, tránh lỗ trắng giữa section */
            className="h-80 w-full rounded-xl border border-line bg-field"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </Reveal>

        <Reveal className="mt-6 text-center">
          <a
            href={WEDDING.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-accent px-8 text-base font-medium text-accent transition-colors duration-200 hover:bg-accent hover:text-paper"
          >
            Xem bản đồ
          </a>
        </Reveal>

      </section>

      {/* ===== Album ảnh ===== */}
      <section className="px-6 py-16">
        <Reveal>
          <Heading>Khoảnh khắc</Heading>
        </Reveal>

        {/* Nhịp magazine: cụm masonry 2 cột xen ảnh ngang tràn viền.
            Hai cột trôi lệch tốc độ khi cuộn (drift-a/b), ảnh ngang parallax như ảnh story.
            Mỗi ảnh vẫn tự quét vào như lát gạch, dùng chung cho scroll lẫn lúc bấm xem thêm */}
        <div className="space-y-3">
          {GALLERY_ROWS.map((row, ri) => {
            const limit = galleryOpen ? GALLERY.length : GALLERY_PREVIEW;
            if (row.type === "wide") {
              if (row.gi >= limit) return null;
              return (
                <Reveal key={row.img.src} effect="tile">
                  <button
                    type="button"
                    onClick={(e) => openLightbox(row.gi, e)}
                    aria-label={`Phóng to ${row.img.alt}`}
                    className="block w-full cursor-zoom-in"
                  >
                    <figure className="relative aspect-3/2 overflow-clip rounded-xl">
                      <Image
                        src={row.img.src}
                        alt={row.img.alt}
                        fill
                        sizes="430px"
                        className="parallax object-cover"
                      />
                    </figure>
                  </button>
                </Reveal>
              );
            }
            const items = row.items.filter(({ gi }) => gi < limit);
            if (!items.length) return null;
            return (
              <div key={`chunk-${ri}`} className="grid grid-cols-2 items-start gap-3">
                {[0, 1].map((c) => (
                  <div
                    key={c}
                    className={`grid gap-3 ${c === 1 ? "mt-8 drift-b" : "drift-a"}`}
                  >
                    {items
                      .filter((_, i) => i % 2 === c)
                      .map(({ img, gi }, i) => (
                        <Reveal key={img.src} effect="tile" delay={(i % 3) * 120 + c * 60}>
                          <button
                            type="button"
                            onClick={(e) => openLightbox(gi, e)}
                            aria-label={`Phóng to ${img.alt}`}
                            className="block w-full cursor-zoom-in overflow-clip rounded-xl"
                          >
                            <Image
                              src={img.src}
                              alt={img.alt}
                              width={img.w}
                              height={img.h}
                              sizes="215px"
                              className="h-auto w-full"
                            />
                          </button>
                        </Reveal>
                      ))}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {!galleryOpen && (
          <Reveal className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setGalleryOpen(true)}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-accent px-8 text-base font-medium text-accent transition-colors duration-200 hover:bg-accent hover:text-paper"
            >
              + Xem thêm
            </button>
          </Reveal>
        )}
      </section>

      {/* ===== RSVP ===== */}
      <section className="bg-alt px-8 py-16">
        <Reveal>
          <Heading>Xác nhận tham dự</Heading>
        </Reveal>

        {sent ? (
          <div className="relative text-center">
            {/* pháo tim chỉ bung khi VỪA gửi, khách quay lại xem thì thôi */}
            {!restored && (
              <div className="pointer-events-none absolute inset-x-0 -top-6 h-36" aria-hidden="true">
                {BURST.map(([left, delay, dur, size], i) => (
                  <span
                    key={i}
                    className="burst-heart"
                    style={{
                      left: `${left}%`,
                      animationDelay: `${delay}s`,
                      animationDuration: `${dur}s`,
                      ["--s" as string]: size,
                    }}
                  />
                ))}
              </div>
            )}
            <p className="text-base leading-relaxed">
              {restored ? (
                <>Bạn đã xác nhận tham dự rồi nè 🥰</>
              ) : (
                <>
                  Cảm ơn bạn đã xác nhận! 🥰
                  <br />
                  Lời chúc của bạn đã nằm gọn trong sổ lưu bút phía dưới 👇
                </>
              )}
            </p>
            {/* Nhắc lại những gì đã gửi, trình bày như một trang lưu bút */}
            {myRsvp && (
              <figure className="relative mx-auto mt-8 max-w-80 rotate-1 rounded-xl border border-line bg-field px-5 pt-5 pb-4 text-left shadow-[0_2px_10px_rgba(44,39,36,0.07)]">
                <span
                  className="absolute -top-3.5 right-4 rotate-12 text-2xl drop-shadow-sm"
                  aria-hidden="true"
                >
                  {myRsvp.vibe}
                </span>
                {myRsvp.wish && (
                  <blockquote className="text-base leading-relaxed">{myRsvp.wish}</blockquote>
                )}
                <figcaption className="mt-2 text-right font-display text-lg text-muted italic">
                  — {myRsvp.name} · {myRsvp.side} · {myRsvp.count} người
                </figcaption>
              </figure>
            )}
          </div>
        ) : (
          <Reveal>
            {/* key: form uncontrolled, remount khi tra ra khách để nhận tên + bên điền sẵn */}
            <form
              onSubmit={submitRsvp}
              key={guestRec ? `g-${guestRec.id}` : guest || "anon"}
              className="space-y-5"
            >
              <div>
                <label htmlFor="name" className="mb-1.5 block text-base font-medium">
                  Bạn tên là gì nhỉ? ✍️
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  defaultValue={guest}
                  placeholder="Nhập tên đáng yêu của bạn..."
                  className="w-full rounded-lg border border-line bg-field px-4 py-3 text-base outline-none placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/30"
                />
              </div>

              <fieldset>
                <legend className="mb-1.5 block text-base font-medium">
                  Bạn là khách của
                </legend>
                <div className="grid grid-cols-2 gap-3">
                  {["Nhà trai", "Nhà gái"].map((side) => (
                    <label
                      key={side}
                      className="flex min-h-12 cursor-pointer items-center justify-center rounded-lg border border-line bg-field text-base has-checked:border-accent has-checked:bg-accent has-checked:text-paper has-focus-visible:ring-2 has-focus-visible:ring-accent/40"
                    >
                      <input
                        type="radio"
                        name="side"
                        value={side}
                        required
                        defaultChecked={guestRec?.side === side}
                        className="sr-only"
                      />
                      {side}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <label htmlFor="count" className="mb-1.5 block text-base font-medium">
                  Bạn đi mấy người nè?
                </label>
                <input
                  id="count"
                  name="count"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={10}
                  defaultValue={1}
                  required
                  className="w-full rounded-lg border border-line bg-field px-4 py-3 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
                />
              </div>

              <fieldset>
                <legend className="mb-1.5 block text-base font-medium">
                  Chọn &ldquo;vibe&rdquo; cho lời chúc
                </legend>
                <div className="grid grid-cols-4 gap-2">
                  {VIBES.map(([emoji, label], i) => (
                    <label
                      key={label}
                      /* label bắn thêm 1 click tổng hợp lên input → chỉ nhận click gốc */
                      onClick={(e) => {
                        if ((e.target as HTMLElement).tagName !== "INPUT") emit(e, [emoji], 4);
                      }}
                      className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-line bg-field py-3 text-2xl transition-all duration-200 has-checked:-translate-y-0.5 has-checked:border-accent has-checked:bg-accent/10 has-checked:shadow-[0_4px_12px_var(--accent-glow-soft)] has-focus-visible:ring-2 has-focus-visible:ring-accent/40"
                    >
                      <input
                        type="radio"
                        name="vibe"
                        value={emoji}
                        defaultChecked={i === 0}
                        className="sr-only"
                      />
                      {emoji}
                      <span className="text-xs font-medium text-muted">{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <label htmlFor="wish" className="mb-1.5 block text-base font-medium">
                  Lời chúc từ trái tim 💌
                </label>
                <div className="relative">
                  <textarea
                    id="wish"
                    name="wish"
                    rows={4}
                    maxLength={300}
                    value={wish}
                    onChange={(e) => setWish(e.target.value)}
                    placeholder="Viết những điều tốt lành nhất vào đây nha..."
                    className="w-full resize-none rounded-lg border border-line bg-field px-4 py-3 pb-7 text-base outline-none placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/30"
                  />
                  <span className="pointer-events-none absolute right-3 bottom-3 text-xs text-muted">
                    {wish.length}/300
                  </span>
                </div>
                {/* Thả nhanh emoji vào lời chúc */}
                <div className="mt-2 flex justify-between gap-2">
                  {WISH_EMOJIS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      aria-label={`Thêm ${em} vào lời chúc`}
                      onClick={(e) => {
                        setWish((w) => (w + em).slice(0, 300));
                        emit(e, [em], 3);
                      }}
                      className="flex h-11 flex-1 items-center justify-center rounded-full border border-line bg-field text-lg transition-colors duration-200 hover:border-accent hover:bg-accent/10"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-accent text-base font-medium text-paper disabled:opacity-60"
              >
                {sending ? (
                  "Đang gửi..."
                ) : (
                  <>
                    Gửi lời chúc ngay
                    <span className="transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-0.5">
                      🚀
                    </span>
                  </>
                )}
              </button>
            </form>
          </Reveal>
        )}
      </section>

      {/* ===== Hộp mừng cưới: đang ẩn, bật enabled trong lib/wedding.ts là hiện ===== */}
      {WEDDING.gift.enabled && (
        <section className="px-6 py-16">
          <Reveal>
            <Heading>Hộp mừng cưới</Heading>
            <p className="-mt-4 mb-8 text-center text-base text-muted">
              Chút tấm lòng gửi qua đây, chúng mình cảm ơn bạn nhiều lắm 💝
            </p>
          </Reveal>

          <div className="grid grid-cols-2 gap-3">
            {WEDDING.gift.accounts.map((acc, i) => (
              <Reveal key={acc.side} delay={i * 120}>
                <div className="flex h-full flex-col items-center rounded-xl border border-line bg-field px-4 py-5 text-center">
                  <p className="text-xs tracking-[0.25em] text-accent uppercase">{acc.side}</p>
                  {acc.qr && (
                    <figure className="relative mt-4 aspect-square w-full max-w-32 overflow-hidden rounded-lg">
                      <Image
                        src={acc.qr}
                        alt={`Mã QR chuyển khoản mừng cưới ${acc.side.toLowerCase()}`}
                        fill
                        sizes="128px"
                        className="object-contain"
                      />
                    </figure>
                  )}
                  <p className="mt-3 text-sm text-muted">{acc.bank}</p>
                  <p className="mt-1 font-display text-xl tracking-wide">{acc.number}</p>
                  <p className="mt-1 text-sm">{acc.holder}</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      copyAccount(acc.number);
                      emit(e, GIFT_EMOJIS, 8);
                      pop(4);
                    }}
                    className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full border border-accent px-5 text-sm font-medium text-accent transition-colors duration-200 hover:bg-accent hover:text-paper"
                  >
                    {copied === acc.number ? "Đã chép ✓" : "Sao chép STK"}
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ===== Sổ lưu bút: lời chúc từ mọi người ===== */}
      {wishes.length > 0 && (
        <section ref={guestbookRef} className="overflow-hidden px-6 py-16">
          <Reveal>
            <Heading>Sổ lưu bút</Heading>
            <p className="-mt-4 mb-8 text-center text-base text-muted">
              {wishes.length} lời chúc yêu thương đã gửi về 💌
            </p>
          </Reveal>

          <div className="space-y-5">
            {wishes.map((w, i) => (
              <Reveal key={w.id} delay={(i % 3) * 100}>
                <figure
                  className={`relative rounded-xl border border-line bg-field px-5 pt-5 pb-4 shadow-[0_2px_10px_rgba(44,39,36,0.07)] ${i % 2 ? "-rotate-1" : "rotate-1"
                    }`}
                >
                  {/* vibe dán như sticker trên mép thiệp */}
                  <span
                    className={`absolute -top-3.5 text-2xl drop-shadow-sm ${i % 2 ? "left-4 -rotate-12" : "right-4 rotate-12"
                      }`}
                    aria-hidden="true"
                  >
                    {w.vibe}
                  </span>
                  <blockquote className="text-base leading-relaxed">{w.wish}</blockquote>
                  <figcaption className="mt-2 text-right font-display text-lg text-muted italic">
                    — {w.name}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ===== Footer: ảnh nền full-bleed ===== */}
      <footer className="relative flex min-h-[70dvh] items-end overflow-hidden">
        <Image
          key={theme.footer}
          src={theme.footer}
          alt={`${COUPLE} trong bộ ảnh cưới khép lại thiệp mời`}
          fill
          sizes="430px"
          className="object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-t from-(--shade)/85 to-transparent" />
        <div className="relative w-full px-8 pb-14 text-center text-paper">
          <Reveal>
            <p className="font-display text-4xl">
              {WEDDING.groomShort} <span className="italic">&</span> {WEDDING.brideShort}
            </p>
            <p className="mt-2 font-display text-lg font-medium text-paper/80 italic">
              {WEDDING.dateDisplay}
            </p>
            <p className="mt-5 text-base text-paper/90">
              Rất hân hạnh được đón tiếp bạn!
            </p>
          </Reveal>
        </div>
      </footer>

      {/* ===== Lightbox album: dialog native, vuốt ngang chuyển ảnh, Esc/chạm nền để đóng ===== */}
      <dialog
        ref={dialogRef}
        onClose={() => setLightbox(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        /* dialog phủ full khung nên nền tối đặt trên chính nó, backdrop chỉ che phần ngoài khung 430px */
        className="lightbox m-auto h-dvh max-h-none w-full max-w-107.5 bg-[#14100e]/95 p-0 backdrop:bg-[#14100e]/95"
      >
        {lightbox !== null && (
          <div
            ref={sheetRef}
            onTouchStart={onLbTouchStart}
            onTouchMove={onLbTouchMove}
            onTouchEnd={onLbTouchEnd}
            onTouchCancel={onLbTouchEnd}
            onDoubleClick={(e) => popLbHeart(e.clientX, e.clientY)}
            className="relative h-full"
          >
            {lbHeart && (
              <span
                key={lbHeart.id}
                aria-hidden="true"
                className="lb-heart pointer-events-none absolute z-10"
                style={{ left: lbHeart.x, top: lbHeart.y }}
              >
                <HeartIcon className="h-24 w-24 text-paper filter-[drop-shadow(0_4px_16px_rgba(0,0,0,0.35))]" />
              </span>
            )}
            <div
              ref={slidesRef}
              onScroll={(e) =>
                setLbIndex(
                  Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth)
                )
              }
              /* touch-pan-x: trình duyệt lo vuốt ngang, vuốt dọc nhường cho cử chỉ kéo-đóng */
              className="flex h-full touch-pan-x snap-x snap-mandatory overflow-x-auto overscroll-contain"
            >
              {GALLERY.map((img, i) => (
                <div
                  key={img.src}
                  className="flex h-full w-full flex-none snap-center items-center justify-center px-2"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    width={img.w}
                    height={img.h}
                    sizes="430px"
                    /* slide đang xem mang cùng tên với thumbnail vừa chạm → morph nối liền */
                    style={i === lbIndex ? { viewTransitionName: "lb-photo" } : undefined}
                    className="max-h-[85dvh] w-auto max-w-full rounded-lg object-contain"
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Đóng ảnh"
              className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#14100e]/60 text-paper backdrop-blur-sm"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
                className="h-5 w-5"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-[#14100e]/60 px-3 py-1 text-xs text-paper backdrop-blur-sm">
              {lbIndex + 1} / {GALLERY.length}
            </p>
          </div>
        )}
      </dialog>
    </main>
  );
}
