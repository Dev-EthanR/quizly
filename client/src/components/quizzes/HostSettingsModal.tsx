import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Switch from "../ui/Switch";
import { DEFAULT_HOST_SETTINGS, type HostSettings } from "../../lib/hostSettings";

interface HostSettingsModalProps {
  onClose: () => void;
  onConfirm: (settings: HostSettings) => void;
}

interface HostSettingOption {
  key: keyof HostSettings;
  label: string;
  description: string;
}

const HOST_SETTING_OPTIONS: HostSettingOption[] = [
  {
    key: "randomizeQuestionOrder",
    label: "Randomize question order",
    description: "Shuffle the question order so each game feels different.",
  },
  {
    key: "allowLateJoins",
    label: "Allow late joins",
    description: "Let players join the room after the game has already started.",
  },
  {
    key: "showCorrectAnswers",
    label: "Show correct answers",
    description: "Reveal the correct answer to players after each question.",
  },
];

function HostSettingsModal({ onClose, onConfirm }: HostSettingsModalProps) {
  const [settings, setSettings] = useState<HostSettings>(DEFAULT_HOST_SETTINGS);

  const handleToggle = (key: keyof HostSettings) => {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <Modal
      title="Host settings"
      ariaLabel="Host settings"
      onClose={onClose}
      maxWidthClassName="max-w-md"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={() => onConfirm(settings)}>
            Host
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {HOST_SETTING_OPTIONS.map((option) => (
          <Switch
            key={option.key}
            checked={settings[option.key]}
            onChange={() => handleToggle(option.key)}
            label={option.label}
            description={option.description}
          />
        ))}
      </div>
    </Modal>
  );
}

export default HostSettingsModal;
