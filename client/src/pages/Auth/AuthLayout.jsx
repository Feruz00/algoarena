import { Link, Outlet } from "react-router";
import {
  CodeOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-slate-950 px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div className="absolute -right-28 -top-24 h-96 w-96 rounded-full bg-blue-600/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
        <Link
          to="/"
          className="relative z-10 flex items-center gap-3 text-xl font-bold text-white"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
            <CodeOutlined />
          </span>{" "}
          AlgoArena
        </Link>
        <div className="relative z-10 max-w-xl pb-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-blue-200">
            <ThunderboltOutlined /> Pikirlen. Ýaz. Bäsleş.
          </div>
          <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
            Seniň indiki ädimleriň mesele çözmek bilen başlanýar.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-slate-300">
            Algoritmiki meseleleri çöz, bäsleşiklere gatnaş we programmistleriň
            hatarynda bol!
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <TrophyOutlined className="text-2xl text-amber-300" />
              <div className="mt-3 text-2xl font-bold">1,200+</div>
              <div className="mt-1 text-sm text-slate-400">Meseleler</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <CodeOutlined className="text-2xl text-blue-300" />
              <div className="mt-3 text-2xl font-bold">Hemme dereje</div>
              <div className="mt-1 text-sm text-slate-400">Aňsatdan Kyna</div>
            </div>
          </div>
        </div>
        <p className="relative z-10 text-sm text-slate-500">
          © {new Date().getFullYear()} AlgoArena · Öwrenmek bilen mesele çöz
        </p>
      </aside>
      <main className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-14 xl:px-24">
        <div className="flex items-center justify-between lg:justify-end">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-slate-900 lg:hidden"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <CodeOutlined />
            </span>
            AlgoArena
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
        <p className="text-center text-xs text-slate-400">Hukuklar goragly</p>
      </main>
    </div>
  );
}
