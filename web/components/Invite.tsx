"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

const LINES = [
  "👩‍❤️‍👨 Mỗi câu chuyện tình yêu đều có một mở đầu đẹp...",
  "🚀 ...và hành trình của chúng mình sắp bước sang một chương mới. 🎉",
  "Thật hạnh phúc khi có bạn trong ngày đặc biệt này. 🫰🥰❤️",
];

const GALLERY = [
  { src: "/assets/gallery/g-1.jpg", alt: "Cô dâu chú rể trong trang phục cổ phục bên hoa sen" },
  { src: "/assets/gallery/g-13.jpg", alt: "Cô dâu chú rể trong bộ trang phục cưới màu kem" },
  { src: "/assets/gallery/g-7.jpg", alt: "Cô dâu cầm nón lá giữa những đóa sen trắng" },
  { src: "/assets/gallery/g-19.jpg", alt: "Chú rể vest đen và cô dâu váy trắng nắm tay nhau" },
  { src: "/assets/gallery/g-16.jpg", alt: "Chú rể trong bộ vest màu kem" },
  { src: "/assets/gallery/g-22.jpg", alt: "Cô dâu chú rể cười đùa bên nhau" },
];

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

const MAPS_URL =
  "https://maps.google.com/?q=Kh%C3%A1nh+C%C6%B0%E1%BB%9Dng,+%C4%90%E1%BB%A9c+Ph%E1%BB%95,+Qu%E1%BA%A3ng+Ng%C3%A3i";

/* Reveal on scroll */
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
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
      className={`reveal ${inView ? "reveal-in" : ""} ${className}`}
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
  const [typed, setTyped] = useState(["", "", ""]);
  const [typedLine, setTypedLine] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const [opened, setOpened] = useState(false);
  const [gateGone, setGateGone] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [slide, setSlide] = useState(0);
  const [sent, setSent] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const touchX = useRef(0);

  /* Typing effect on the welcome gate */
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let line = 0;
    let ch = 0;
    let interval: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      if (reduced) {
        setTyped(LINES);
        setTypedLine(LINES.length);
        setShowCard(true);
        return;
      }
      interval = setInterval(() => {
        ch += 1;
        const current = line;
        const text = LINES[current].slice(0, ch);
        setTyped((prev) => {
          const next = [...prev];
          next[current] = text;
          return next;
        });
        if (ch >= LINES[current].length) {
          line += 1;
          ch = 0;
          setTypedLine(line);
          if (line >= LINES.length) {
            clearInterval(interval);
            setTimeout(() => setShowCard(true), 700);
          }
        }
      }, 40);
    }, reduced ? 0 : 500);
    return () => {
      clearTimeout(start);
      clearInterval(interval);
    };
  }, []);

  /* Lock scroll while the gate is closed */
  useEffect(() => {
    document.body.style.overflow = gateGone ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [gateGone]);

  const openInvite = () => {
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

  const prevSlide = () => setSlide((s) => (s - 1 + GALLERY.length) % GALLERY.length);
  const nextSlide = () => setSlide((s) => (s + 1) % GALLERY.length);

  const submitRsvp = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    /* ponytail: chưa có backend, nối Google Form / Apps Script khi cần lưu phản hồi */
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
            className={`absolute inset-0 flex flex-col items-center justify-center px-8 text-center transition-opacity duration-300 ${opened ? "opacity-0" : ""
              }`}
          >
            <div className="space-y-3">
              {LINES.map((line, i) => (
                <p key={line} className="relative text-lg leading-relaxed font-medium text-black">
                  {/* dòng đầy đủ tàng hình giữ chỗ, chữ gõ đè lên trên: không giật layout */}
                  <span className="invisible">{line}</span>
                  <span
                    className={`absolute inset-0 ${typedLine === i && typed[i].length < line.length ? "caret" : ""
                      }`}
                  >
                    {typed[i]}
                  </span>
                </p>
              ))}
            </div>

            <div
              className={`mt-10 w-full border border-line bg-white/50 px-4   rounded-md py-10 transition-all duration-700 ease-(--ease) ${showCard ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                }`}
            >
              <p className="text-sm tracking-[0.25em] mb-6 text-muted uppercase">
                Thiệp mời lễ cưới
              </p>
              <p className="mt-4 font-display text-4xl font-bold flex items-center flex-col justify-center gap-2 whitespace-nowrap">
                {/* tên chú rể lướt vào từ trái, cô dâu từ phải, sau khi khung thiệp hiện */}
                <span
                  className={`transition-all delay-300 duration-700 ease-(--ease) ${showCard ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"
                    }`}
                >
                  Xuân Hậu
                </span>
                <Image
                  src="/heart.webp"
                  alt=""
                  width={80}
                  height={80}
                  className={`transition-opacity delay-700 duration-500 ${showCard ? "opacity-100" : "opacity-0"
                    }`}
                />
                <span
                  className={`transition-all delay-500 duration-700 ease-(--ease) ${showCard ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0"
                    }`}
                >
                  Thúy Uyên
                </span>
              </p>
              <p className="mt-2 font-display text-xl font-medium text-muted italic">
                02 . 08 . 2026
              </p>

              {/* Trái tim đập: chạm để bóc thiệp */}
              <button
                type="button"
                onClick={openInvite}
                disabled={!showCard}
                aria-label="Bóc thiệp cưới"
                className="group mt-9 inline-flex flex-col items-center"
              >
                <span
                  className={`relative block h-28 w-28 transition-all duration-500 ease-(--ease) ${opened ? "scale-150 opacity-0" : ""
                    }`}
                >
                  {/* bóng tim lan tỏa sau mỗi nhịp đập */}
                  <HeartIcon className="heart-echo absolute inset-0 h-full w-full text-accent" />
                  <span className="heartbeat absolute inset-0 block">
                    <HeartIcon className="h-full w-full text-accent filter-[drop-shadow(0_4px_12px_rgba(142,59,44,0.4))]" />
                    <span className="absolute inset-x-0 top-[30%] font-display text-2xl text-paper italic">
                      H<span className="mx-0.5 text-lg">&</span>U
                    </span>
                  </span>
                </span>
                <span
                  className={`mt-4 text-base font-medium tracking-wide text-accent transition-opacity duration-300 ${opened ? "opacity-0" : ""
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
          alt="Xuân Hậu và Thúy Uyên trong trang phục cưới"
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
                <span className="whitespace-nowrap">Xuân Hậu</span>{" "}
                <br />
                <p className="text-[2.25rem] italic">&</p>{" "}
                <span className="whitespace-nowrap">Thúy Uyên</span>
              </h1>
              <p className="rise mt-3 text-[17px] text-paper/85" style={{ animationDelay: "650ms" }}>
                Chủ Nhật, ngày 02 tháng 08 năm 2026
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
            <h3 className="font-display text-[1.75rem]">Lễ Vu Quy</h3>
            <p className="mt-1 text-sm text-muted">Nhà gái</p>
            <p className="mt-4 text-base leading-relaxed">
              {/* TODO: điền họ tên đầy đủ của mẹ cô dâu */}
              Nhà gái: Bà Nguyễn Thị
            </p>
            {/* TODO: chỉnh lại giờ làm lễ nếu cần */}
            <p className="mt-1 text-base">09:00, Chủ Nhật ngày 02.08.2026</p>
            <p className="mt-1 text-base text-muted">
              Tư gia nhà gái, Khánh Cường, Đức Phổ, Quảng Ngãi
            </p>
          </div>
        </Reveal>

        <div className="mx-auto my-10 h-px w-full bg-line" />

        <Reveal>
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
        </Reveal>

        <Reveal className="mt-8 text-center">
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-accent px-8 text-base font-medium text-accent transition-colors duration-200 hover:bg-accent hover:text-paper"
          >
            Xem bản đồ
          </a>
        </Reveal>

        {/* Lịch tháng 10.2026 */}
        <Reveal className="mt-12">
          <p className="text-center font-display text-2xl">Tháng 08, 2026</p>
          <div className="mt-5 grid grid-cols-7 gap-y-2 text-center text-base">
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
              <span key={d} className={d === "CN" ? "font-medium text-accent" : "text-muted"}>
                {d}
              </span>
            ))}
            {/* 01.10.2026 rơi vào thứ Năm */}
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={`pad-${i}`} />
            ))}
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) =>
              day === 4 ? (
                <span key={day} className="flex justify-center">
                  <span className="pulse-ring inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent font-medium text-paper">
                    4
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

        <Reveal>
          <div
            className="relative aspect-2/3 overflow-hidden rounded-xl"
            onTouchStart={(e) => {
              touchX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (dx > 40) prevSlide();
              if (dx < -40) nextSlide();
            }}
          >
            {GALLERY.map((img, i) => (
              <Image
                key={img.src}
                src={img.src}
                alt={img.alt}
                fill
                sizes="430px"
                loading={i === 0 ? undefined : "lazy"}
                className={`object-cover transition-opacity duration-500 ${i === slide ? "opacity-100" : "opacity-0"
                  }`}
              />
            ))}

            <button
              type="button"
              onClick={prevSlide}
              aria-label="Ảnh trước"
              className="absolute top-1/2 left-3 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-xl text-ink"
            >
              &lsaquo;
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Ảnh sau"
              className="absolute top-1/2 right-3 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-xl text-ink"
            >
              &rsaquo;
            </button>
          </div>

          <div className="mt-4 flex justify-center gap-2" aria-hidden="true">
            {GALLERY.map((img, i) => (
              <span
                key={img.src}
                className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${i === slide ? "bg-accent" : "bg-line"
                  }`}
              />
            ))}
          </div>
        </Reveal>
      </section>

      {/* ===== RSVP ===== */}
      <section className="bg-[#f3ece2] px-8 py-16">
        <Reveal>
          <Heading>Xác nhận tham dự</Heading>
        </Reveal>

        {sent ? (
          <p className="text-center text-base leading-relaxed">
            Cảm ơn bạn đã xác nhận!
            <br />
            Hẹn gặp bạn trong ngày vui của chúng mình.
          </p>
        ) : (
          <Reveal>
            <form onSubmit={submitRsvp} className="space-y-5">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-base font-medium">
                  Họ và tên
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  className="w-full rounded-lg border border-line bg-[#fffdf9] px-4 py-3 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
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
                  Số người tham dự
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

              <div>
                <label htmlFor="wish" className="mb-1.5 block text-base font-medium">
                  Lời chúc
                </label>
                <textarea
                  id="wish"
                  name="wish"
                  rows={4}
                  className="w-full resize-none rounded-lg border border-line bg-[#fffdf9] px-4 py-3 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
                />
              </div>

              <button
                type="submit"
                className="min-h-12 w-full rounded-full bg-accent text-base font-medium text-paper"
              >
                Gửi lời chúc
              </button>
            </form>
          </Reveal>
        )}
      </section>

      {/* ===== Footer: ảnh nền full-bleed ===== */}
      <footer className="relative flex min-h-[70dvh] items-end overflow-hidden">
        <Image
          src="/assets/footer.jpg"
          alt="Xuân Hậu và Thúy Uyên chạm trán sau chiếc quạt, nền đỏ trầm"
          fill
          sizes="430px"
          className="object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-t from-[#1c0f0b]/85 to-transparent" />
        <div className="relative w-full px-8 pb-14 text-center text-paper">
          <Reveal>
            <p className="font-display text-4xl">
              Hậu <span className="italic">&</span> Uyên
            </p>
            <p className="mt-2 font-display text-lg font-medium text-paper/80 italic">
              02 . 08 . 2026
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
