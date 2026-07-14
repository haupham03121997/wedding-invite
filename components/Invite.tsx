"use client";

import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Typed from "typed.js";
import { COUPLE, WEDDING } from "@/lib/wedding";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

const LINES = [
  "👩‍❤️‍👨 Chuyện tình nào cũng có mở đầu đẹp...",
  "🚀 ...và tụi mình sắp sang chương mới. 🎉",
  "Thật vui khi có bạn ngày hôm ấy. 🫰🥰❤️",
];
/* Mấy câu mời chạm xoay vòng trên màn chào — càng lầy càng dễ được bấm */
const TAP_LINES = [
  "Chạm vào màn hình để nhận thiệp 💌",
  "Thiệp này không tự mở được đâu 👀",
  "Chạm nhẹ thôi nha, thiệp dễ rách lắm 🥺",
  "Hong chạm là tụi mình giận đó 😤",
  "Chạm đi chờ chi! 🫵",
];
/* Vibe cho lời chúc + emoji thả nhanh vào ô lời chúc */
const VIBES: [string, string][] = [
  ["🎉", "Vui vẻ"],
  ["💝", "Ngọt ngào"],
  ["🥳", "Quẩy"],
  ["💸", "Giàu sang"],
];
const WISH_EMOJIS = ["❤️", "🥰", "💍", "🎊", "🍾", "😘"];

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
const CAL_LABEL = `Tháng ${String(wd.getMonth() + 1).padStart(2, "0")}, ${wd.getFullYear()}`;
const CAL_PAD = (new Date(wd.getFullYear(), wd.getMonth(), 1).getDay() + 6) % 7; // offset thứ 2
const CAL_DAYS = new Date(wd.getFullYear(), wd.getMonth() + 1, 0).getDate();
const CAL_DAY = wd.getDate();

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

export default function Invite() {
  const [showCard, setShowCard] = useState(false);
  const [started, setStarted] = useState(false);
  const [opened, setOpened] = useState(false);
  const [gateGone, setGateGone] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [tapIdx, setTapIdx] = useState(0);
  const [wish, setWish] = useState("");
  const [wishes, setWishes] = useState<Wish[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const typedRef = useRef<HTMLSpanElement>(null);

  /* Typing effect on the welcome gate (typed.js) + tiếng gõ phím WebAudio */
  useEffect(() => {
    const el = typedRef.current;
    if (!el) return;
    /* Trình duyệt chặn âm thanh trước khi người dùng chạm, nên chờ lần chạm
       đầu tiên rồi mới bắt đầu gõ chữ + tiếng gõ phím — luôn đồng bộ với nhau */
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const keyAudio = new Audio("/typing.mp3");
    keyAudio.loop = true;
    keyAudio.volume = 0.6;
    let typed: Typed | undefined;
    const start = () => {
      setStarted(true);
      if (reduced) {
        el.textContent = LINES.join("\n");
        setShowCard(true);
        return;
      }
      keyAudio.play().catch(() => { });
      typed = new Typed(el, {
        strings: [LINES.join("\n")],
        typeSpeed: 18,
        startDelay: 300,
        onComplete: () => {
          keyAudio.pause();
          setTimeout(() => setShowCard(true), 400);
        },
      });
    };
    window.addEventListener("pointerdown", start, { once: true });

    return () => {
      keyAudio.pause();
      typed?.destroy();
      window.removeEventListener("pointerdown", start);
    };
  }, []);

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

  /* Xoay vòng câu mời chạm cho tới khi khách chịu chạm */
  useEffect(() => {
    if (started) return;
    const id = setInterval(() => setTapIdx((i) => (i + 1) % TAP_LINES.length), 2600);
    return () => clearInterval(id);
  }, [started]);

  /* Lock scroll while the gate is closed */
  useEffect(() => {
    document.body.style.overflow = gateGone ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [gateGone]);

  const openInvite = () => {
    /* Reload giữa trang: trình duyệt khôi phục vị trí scroll cũ, kéo về đầu trước khi mở */
    window.scrollTo(0, 0);
    setOpened(true);
    const audio = audioRef.current;
    audio
      ?.play()
      .then(() => setPlaying(true))
      .catch(() => { });
    setTimeout(() => setGateGone(true), 1300);
  };

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => setPlaying(true)).catch(() => { });
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  const submitRsvp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    const f = new FormData(e.currentTarget);
    const { data, error } = await supabase
      .from("rsvps")
      .insert({
        name: f.get("name"),
        side: f.get("side"),
        count: Number(f.get("count")),
        vibe: f.get("vibe"),
        wish: f.get("wish"),
      })
      .select("id,name,vibe,wish")
      .single();
    setSending(false);
    if (error) {
      alert("Gửi không thành công, bạn thử lại nhé!");
      return;
    }
    /* Lời chúc vừa gửi hiện ngay đầu sổ lưu bút */
    if (data?.wish) setWishes((w) => [data, ...w]);
    setSent(true);
  };

  return (
    <main className="overflow-hidden">
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
            {!started && (
              <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center gap-4 px-8">
                <span className="tap-hand text-5xl" aria-hidden="true">
                  👆
                </span>
                {/* key đổi theo câu → React thay phần tử → animation pop chạy lại */}
                <p key={tapIdx} className="line-pop text-base font-medium text-muted">
                  {TAP_LINES[tapIdx]}
                </p>
              </div>
            )}
            <div className="relative text-base leading-relaxed font-medium text-black mb-5">
              {/* khối chữ đầy đủ tàng hình giữ chỗ, typed.js gõ đè lên trên: không giật layout */}
              <p className="invisible whitespace-pre-line">{LINES.join("\n")}</p>
              <p className="absolute inset-0 whitespace-pre-line">
                <span ref={typedRef} />
              </p>
            </div>

            <div
              className={`mt-6 w-full border border-line bg-white/50 px-4 rounded-md py-6 transition-all duration-700 ease-(--ease) ${showCard ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                }`}
            >
              <p className="text-sm tracking-[0.25em] mb-3 text-muted uppercase">
                Thiệp mời lễ cưới
              </p>
              <p className="mt-2 font-display text-3xl font-bold flex items-center flex-col justify-center gap-1 whitespace-nowrap">
                {/* tên cô dâu chú rể hiện dần từ mờ nhòe sang rõ nét, so le nhau */}
                <span
                  className={`transition-all delay-300 duration-1400 ease-(--ease) ${showCard ? "scale-100 opacity-100 blur-none" : "scale-95 opacity-0 blur-sm"
                    }`}
                >
                  {WEDDING.groom}
                </span>
                <Image
                  src="/heart.webp"
                  alt=""
                  width={56}
                  height={56}
                  className={`transition-all delay-1200 duration-500 ease-(--ease) ${showCard ? "scale-100 opacity-100" : "scale-95 opacity-0"
                    }`}
                />
                <span
                  className={`transition-all delay-700 duration-1400 ease-(--ease) ${showCard ? "scale-100 opacity-100 blur-none" : "scale-95 opacity-0 blur-sm"
                    }`}
                >
                  {WEDDING.bride}
                </span>
              </p>
              <p className="mt-2 font-display text-2xl font-bold text-muted italic">
                {WEDDING.dateDisplay}
              </p>

              {/* Trái tim đập: chạm để bóc thiệp */}
              <button
                type="button"
                onClick={openInvite}
                disabled={!showCard}
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
                    <HeartIcon className="h-full w-full text-accent filter-[drop-shadow(0_4px_12px_rgba(142,59,44,0.4))]" />
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
                "radial-gradient(circle, #8e3b2c 0 8px, #faf7f2 8px 9px, #2c2724 9px 11px, #3a332e 11px 13px, #2c2724 13px 15px, #3a332e 15px 17px, #2c2724 17px)",
            }}
          />
          {!playing && (
            <span className="absolute top-1/2 left-1/2 h-10 w-px -translate-x-1/2 -translate-y-1/2 rotate-45 bg-paper" />
          )}
        </button>
      )}

      {/* ===== Trang bìa ===== */}
      <section className="relative flex h-dvh items-end overflow-hidden">
        <Image
          src="/assets/cover.jpg"
          alt={`${COUPLE} trong trang phục cưới`}
          fill
          priority
          sizes="430px"
          className={`object-cover object-top ${opened ? "kenburns" : ""}`}
        />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-[#1c1512]/75 to-transparent" />
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
      <section className="px-8 py-16 text-center">
        <Reveal>
          <p className="font-display text-[1.75rem] leading-snug italic">
            &ldquo;Yêu nhau mấy núi cũng trèo, ngày vui của chúng mình chỉ thiếu mỗi bạn.&rdquo;
          </p>
          <p className="mt-6 text-[17px] leading-relaxed text-muted">
            Chúng mình cưới! Sự hiện diện của bạn là niềm vinh hạnh lớn nhất
            đối với gia đình hai bên.
          </p>
        </Reveal>
      </section>

      {/* ===== Câu chuyện ===== */}
      <section className="px-6 pt-4 pb-16">
        <Reveal>
          <Heading>Chuyện chúng mình</Heading>
        </Reveal>

        <div className="space-y-14">
          <Reveal>
            <figure className="relative aspect-4/5 overflow-hidden rounded-xl">
              <Image
                src="/assets/story-1.jpg"
                alt="Hai đứa trong bộ cổ phục ngày dạm ngõ"
                fill
                sizes="430px"
                className="object-cover"
              />
            </figure>
            <h3 className="mt-5 font-display text-[1.75rem]">Ngày mình gặp nhau</h3>
            <p className="mt-2 text-base leading-relaxed text-muted">
              Một lần tình cờ chạm mặt, rồi chẳng hiểu sao cứ muốn gặp lại
              thêm nhiều lần nữa.
            </p>
          </Reveal>

          <Reveal className="ml-10">
            <figure className="relative aspect-4/5 overflow-hidden rounded-xl">
              <Image
                src="/assets/story-2.jpg"
                alt="Hai đứa cười tươi trong bộ đồ cưới màu kem"
                fill
                sizes="390px"
                className="object-cover"
              />
            </figure>
            <h3 className="mt-5 font-display text-[1.75rem]">Những năm tháng bên nhau</h3>
            <p className="mt-2 text-base leading-relaxed text-muted">
              Từ những buổi hẹn vụng về đến lúc hiểu nhau chỉ qua một ánh mắt.
            </p>
          </Reveal>

          <Reveal className="mr-10">
            <figure className="relative aspect-4/5 overflow-hidden rounded-xl">
              <Image
                src="/assets/story-3.jpg"
                alt="Khoảnh khắc mở champagne ăn mừng"
                fill
                sizes="390px"
                className="object-cover"
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
      <section className="bg-[#f3ece2] px-8 py-16">
        <Reveal>
          <Heading>Hôn lễ</Heading>
        </Reveal>

        <Reveal>
          <div className="text-center">
            <h3 className="font-display text-[1.75rem]">{WEDDING.ceremony.title}</h3>
            <p className="mt-1 text-sm text-muted">{WEDDING.ceremony.side}</p>
            <p className="mt-4 text-base leading-relaxed">{WEDDING.ceremony.hosts}</p>
            <p className="mt-1 text-base">{WEDDING.ceremony.time}</p>
            <p className="mt-1 text-base text-muted">{WEDDING.ceremony.address}</p>
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
            className="h-80 w-full rounded-xl border-0"
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

        {/* Lịch tháng 08.2026 */}
        <Reveal className="mt-12">
          <p className="text-center font-display text-2xl">{CAL_LABEL}</p>
          <div className="mt-5 grid grid-cols-7 gap-y-2 text-center text-base">
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
                <span key={day} className="flex justify-center">
                  <span className="pulse-ring inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent font-medium text-paper">
                    {day}
                  </span>
                </span>
              ) : (
                <span key={day} className="inline-flex h-10 items-center justify-center">
                  {day}
                </span>
              )
            )}
          </div>
        </Reveal>
      </section>

      {/* ===== Album ảnh ===== */}
      <section className="px-6 py-16">
        <Reveal>
          <Heading>Khoảnh khắc</Heading>
        </Reveal>

        {/* Masonry 2 cột: chia ảnh chẵn/lẻ vào 2 cột cố định để lúc mở rộng,
            ảnh cũ đứng yên, ảnh mới chỉ nối thêm vào đuôi mỗi cột.
            Mỗi ảnh tự quan sát viewport và quét vào như lát gạch từ trên xuống —
            dùng chung cho cả scroll lẫn lúc bấm xem thêm */}
        <div className="grid grid-cols-2 items-start gap-3">
          {[0, 1].map((c) => (
            <div key={c} className={`grid gap-3 ${c === 1 ? "mt-8" : ""}`}>
              {(galleryOpen ? GALLERY : GALLERY.slice(0, GALLERY_PREVIEW))
                .filter((_, i) => i % 2 === c)
                .map((img, i) => (
                  <Reveal key={img.src} effect="tile" delay={(i % 3) * 120 + c * 60}>
                    <figure className="overflow-hidden rounded-xl">
                      <Image
                        src={img.src}
                        alt={img.alt}
                        width={img.w}
                        height={img.h}
                        sizes="215px"
                        className="h-auto w-full"
                      />
                    </figure>
                  </Reveal>
                ))}
            </div>
          ))}
        </div>

        {!galleryOpen && (
          <Reveal className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setGalleryOpen(true)}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-accent px-8 text-base font-medium text-accent transition-colors duration-200 hover:bg-accent hover:text-paper"
            >
              + {GALLERY.length - GALLERY_PREVIEW} ảnh nữa
            </button>
          </Reveal>
        )}
      </section>

      {/* ===== RSVP ===== */}
      <section className="bg-[#f3ece2] px-8 py-16">
        <Reveal>
          <Heading>Xác nhận tham dự</Heading>
        </Reveal>

        {sent ? (
          <p className="text-center text-base leading-relaxed">
            Cảm ơn bạn đã xác nhận! 🥰
            <br />
            Lời chúc của bạn đã nằm gọn trong sổ lưu bút phía dưới 👇
          </p>
        ) : (
          <Reveal>
            <form onSubmit={submitRsvp} className="space-y-5">
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
                  placeholder="Nhập tên đáng yêu của bạn..."
                  className="w-full rounded-lg border border-line bg-[#fffdf9] px-4 py-3 text-base outline-none placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/30"
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
                      className="flex min-h-12 cursor-pointer items-center justify-center rounded-lg border border-line bg-[#fffdf9] text-base has-checked:border-accent has-checked:bg-accent has-checked:text-paper has-focus-visible:ring-2 has-focus-visible:ring-accent/40"
                    >
                      <input
                        type="radio"
                        name="side"
                        value={side}
                        required
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
                  className="w-full rounded-lg border border-line bg-[#fffdf9] px-4 py-3 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
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
                      className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-line bg-[#fffdf9] py-3 text-2xl transition-all duration-200 has-checked:-translate-y-0.5 has-checked:border-accent has-checked:bg-accent/10 has-checked:shadow-[0_4px_12px_rgba(142,59,44,0.15)] has-focus-visible:ring-2 has-focus-visible:ring-accent/40"
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
                    className="w-full resize-none rounded-lg border border-line bg-[#fffdf9] px-4 py-3 pb-7 text-base outline-none placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/30"
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
                      onClick={() => setWish((w) => (w + em).slice(0, 300))}
                      className="flex h-11 flex-1 items-center justify-center rounded-full border border-line bg-[#fffdf9] text-lg transition-colors duration-200 hover:border-accent hover:bg-accent/10"
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

      {/* ===== Sổ lưu bút: lời chúc từ mọi người ===== */}
      {wishes.length > 0 && (
        <section className="overflow-hidden px-6 py-16">
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
                  className={`relative rounded-xl border border-line bg-[#fffdf9] px-5 pt-5 pb-4 shadow-[0_2px_10px_rgba(44,39,36,0.07)] ${i % 2 ? "-rotate-1" : "rotate-1"
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
          src="/assets/footer.jpg"
          alt={`${COUPLE} chạm trán sau chiếc quạt, nền đỏ trầm`}
          fill
          sizes="430px"
          className="object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-t from-[#1c0f0b]/85 to-transparent" />
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
    </main>
  );
}
