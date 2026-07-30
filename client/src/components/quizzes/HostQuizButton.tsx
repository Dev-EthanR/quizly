import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlay } from "react-icons/fi";
import Button from "../ui/Button";
import HostSettingsModal from "./HostSettingsModal";
import type { HostSettings } from "../../entities/hostSettings";

interface HostQuizButtonProps {
  quizId: string;
  label?: string;
  className?: string;
}

function HostQuizButton({
  quizId,
  label = "Host",
  className = "flex items-center gap-2",
}: HostQuizButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleConfirm = (settings: HostSettings) => {
    setIsModalOpen(false);
    navigate(`/host/${quizId}`, { state: { settings } });
  };

  return (
    <>
      <Button type="button" className={className} onClick={() => setIsModalOpen(true)}>
        <FiPlay className="h-4 w-4" />
        {label}
      </Button>

      {isModalOpen && (
        <HostSettingsModal
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}

export default HostQuizButton;
