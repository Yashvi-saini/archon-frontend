import { SettingsView } from "@/features/settings";

export const metadata = {
  title: "Settings | Archon",
  description: "Configure workspace, target roles, and AI interview preferences",
};

export default function SettingsPage() {
  return <SettingsView />;
}
