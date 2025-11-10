// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import { LogoWhite } from '../images/icons';
import { useSettings } from '../contexts/useSettings';

export default function GroupLogo() {
  const { settings } = useSettings();

  return (
    <div>
      {settings.logo && <img src={settings.logo} alt="" />}
      {!settings.logo && <LogoWhite className="h-12 mr-2" />}
    </div>
  );
}
