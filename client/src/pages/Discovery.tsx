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
    <div className="page-shell">
      <Navbar />

      <div className="page-container max-w-360">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="heading text-3xl">Discover Quizzes</h1>

          <PillTabs options={TAB_OPTIONS} value={tab} onChange={setTab} />
        </div>

        {tab === "browse" && <BrowseQuizzesTab />}
        {tab === "saved" && <SavedQuizzesTab />}
      </div>
    </div>
  );
}

export default Discovery;
