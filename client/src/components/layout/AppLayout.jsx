import { useState } from "react";
import { Outlet, useLocation, matchPath } from "react-router";
import { Button, Drawer, Grid } from "antd";
import { DoubleRightOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import ProblemAside from "./ProblemAside";
import useNotification from "../../store/notification";

export default function AppLayout() {
  const location = useLocation();
  const { t } = useTranslation();

  const screens = Grid.useBreakpoint();
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [problemAsideOpen, setProblemAsideOpen] = useState(false);
  const isDesktop = Boolean(screens.lg);
  const problemMatch =
    matchPath({ path: "/problems/:problemId", end: true }, location.pathname) ||
    matchPath(
      { path: "contests/:id/problems/:problemId", end: true },
      location.pathname,
    ) ||
    matchPath(
      { path: "sources/:id/problems/:problemId", end: true },
      location.pathname,
    );

  const isProblemPage = Boolean(problemMatch);
  const problemId = problemMatch?.params?.id;

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader onOpenNavigation={() => setNavigationOpen(true)} />
      <div className="flex min-h-[calc(100vh-64px)]">
        {isDesktop && (
          <aside className="sticky top-16 h-[calc(100vh-64px)] w-60 shrink-0 border-r border-slate-200 bg-white">
            <AppSidebar />
          </aside>
        )}
        <main className="min-w-0 flex-1 p-3 sm:p-5 lg:p-6">
          <div className="mx-auto w-full max-w-[1800px]">
            {isProblemPage && !isDesktop && (
              <div className="mb-3 flex justify-end">
                <Button
                  icon={<DoubleRightOutlined />}
                  onClick={() => setProblemAsideOpen(true)}
                  aria-label={t("common.openMenu")}
                >
                  {t("problem.submit")}
                </Button>
              </div>
            )}
            <Outlet />
          </div>
        </main>
        {isProblemPage && isDesktop && (
          <aside className="sticky top-16 h-[calc(100vh-64px)] w-[360px] shrink-0 overflow-y-auto border-l border-slate-200 bg-slate-50 p-4 xl:w-[400px]">
            <ProblemAside problemId={problemId} />
          </aside>
        )}
      </div>
      <Drawer
        title={t("app.name")}
        placement="left"
        width={280}
        open={navigationOpen}
        onClose={() => setNavigationOpen(false)}
        styles={{ body: { padding: 0 } }}
      >
        <AppSidebar onNavigate={() => setNavigationOpen(false)} />
      </Drawer>
      <Drawer
        title={t("problem.submit")}
        placement="right"
        width={460}
        open={problemAsideOpen && isProblemPage}
        onClose={() => setProblemAsideOpen(false)}
        styles={{ body: { padding: 16, background: "#f8fafc" } }}
      >
        {isProblemPage && (
          <ProblemAside
            problemId={problemId}
            onSubmit={() => setProblemAsideOpen(false)}
          />
        )}
      </Drawer>
    </div>
  );
}
