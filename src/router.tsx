import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { Today } from "./pages/Today";
import { Line } from "./pages/Line";
import { Practice } from "./pages/Practice";
import { Foundations } from "./pages/Foundations";
import { Characters } from "./pages/Characters";
import { Dojo } from "./pages/Dojo";
import { VocabLesson } from "./pages/VocabLesson";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Today /> },
      { path: "line", element: <Line /> },
      { path: "practice", element: <Practice /> },
      { path: "foundations", element: <Foundations /> },
      { path: "characters", element: <Characters /> },
      { path: "dojo", element: <Dojo /> },
      { path: "basics", element: <VocabLesson page="basics" /> },
      { path: "family", element: <VocabLesson page="family" /> },
      { path: "beyond", element: <VocabLesson page="beyond" /> },
      { path: "conversational", element: <VocabLesson page="conversational" /> },
    ],
  },
]);
