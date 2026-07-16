import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { SessionOverlay } from "./SessionOverlay";

/** Centered app frame + fixed bottom nav + the session overlay. */
export function AppLayout() {
  return (
    <>
      <div
        className="relative mx-auto min-h-screen max-w-[560px] px-5"
        style={{
          paddingTop: "calc(10px + env(safe-area-inset-top))",
          paddingBottom: "calc(96px + env(safe-area-inset-bottom))",
        }}
      >
        <Outlet />
      </div>
      <BottomNav />
      <SessionOverlay />
    </>
  );
}
