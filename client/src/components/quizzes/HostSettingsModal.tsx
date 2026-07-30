import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Switch from "../ui/Switch";
import Input from "../ui/Input";
import {
  DEFAULT_HOST_SETTINGS,
  MAX_PLAYERS_MAX,
  MAX_PLAYERS_MIN,
} from "../../lib/hostSettings";
import type { HostSettings } from "../../entities/hostSettings";

interface HostSettingsModalProps {
  onClose: () => void;
  onConfirm: (settings: HostSettings) => void;
}

type BooleanHostSettingKey = Exclude<keyof HostSettings, "maxPlayers">;

interface HostSettingOption {
  key: BooleanHostSettingKey;
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
  {
    key: "disableChat",
    label: "Disable chat",
    description: "Turn off chat for everyone, including you, for this game.",
  },
];

function HostSettingsModal({ onClose, onConfirm }: HostSettingsModalProps) {
  const [settings, setSettings] = useState<HostSettings>(DEFAULT_HOST_SETTINGS);

  const handleToggle = (key: BooleanHostSettingKey) => {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  };

  const handleMaxPlayersChange = (value: string) => {
    if (value === "") {
      setSettings((current) => ({ ...current, maxPlayers: null }));
      return;
    }
    const parsed = Math.round(Number(value));
    if (Number.isNaN(parsed)) {
      return;
    }
    const clamped = Math.min(MAX_PLAYERS_MAX, Math.max(MAX_PLAYERS_MIN, parsed));
    setSettings((current) => ({ ...current, maxPlayers: clamped }));
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

        <div className="flex flex-col gap-1">
          <Input
            type="number"
            label="Max players"
            min={MAX_PLAYERS_MIN}
            max={MAX_PLAYERS_MAX}
            placeholder="Unlimited"
            value={settings.maxPlayers ?? ""}
            onChange={(event) => handleMaxPlayersChange(event.target.value)}
          />
          <p className="text-sm text-muted">Leave blank for unlimited players.</p>
        </div>
      </div>
    </Modal>
  );
}

export default HostSettingsModal;
