import { useState } from "react";
import Navbar from "../components/layout/Navbar";
import PillTabs from "../components/ui/PillTabs";
import BrowseQuizzesTab from "../components/quizzes/BrowseQuizzesTab";
import SavedQuizzesTab from "../components/quizzes/SavedQuizzesTab";

type DiscoveryTab = "browse" | "saved";

interface TabOption {
  label: string;
  value: DiscoveryTab;
}

const TAB_OPTIONS: TabOption[] = [
  { label: "Browse", value: "browse" },
  { label: "Saved", value: "saved" },
];

function Discovery() {
  const [tab, setTab] = useState<DiscoveryTab>("browse");

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-360 px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-foreground">Discover Quizzes</h1>

          <PillTabs options={TAB_OPTIONS} value={tab} onChange={setTab} />
        </div>

        {tab === "browse" && <BrowseQuizzesTab />}
        {tab === "saved" && <SavedQuizzesTab />}
      </div>
    </div>
  );
}

export default Discovery;
