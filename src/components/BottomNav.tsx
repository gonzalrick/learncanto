import { NavLink } from "react-router-dom";
import { IconHome, IconLine, IconPractice } from "./icons";

const items = [
  { to: "/", label: "Today", Icon: IconHome, end: true },
  { to: "/line", label: "Line", Icon: IconLine, end: false },
  { to: "/practice", label: "Practice", Icon: IconPractice, end: false },
];

/** Fixed bottom navigation — Today / Line / Practice. */
export function BottomNav() {
  return (
    <nav
      aria-label="App navigation"
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center border-t border-line2 backdrop-blur-md"
      style={{
        background: "color-mix(in srgb, var(--bg) 90%, black)",
        paddingTop: 8,
        paddingBottom: "calc(10px + env(safe-area-inset-bottom))",
      }}
    >
      <div className="flex w-full max-w-[560px] px-2.5">
        {items.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              "flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 font-disp text-[10.5px] font-semibold tracking-[.05em] " +
              (isActive ? "text-acc2" : "text-mut")
            }
          >
            <Icon className="h-[22px] w-[22px]" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
