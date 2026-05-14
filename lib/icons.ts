import type { IconProps } from "@tabler/icons-react";
import type { ComponentType } from "react";
import {
  IconEdit,
  IconLayoutDashboard,
  IconLink,
  IconLock,
  IconNotes,
  IconPalette,
  IconRss,
  IconSettings,
  IconTrash,
  IconUsers,
} from "@tabler/icons-react";

export type IconComponent = ComponentType<IconProps>;
export type IconName =
  | "dashboard"
  | "delete"
  | "edit"
  | "identity"
  | "link"
  | "lock"
  | "release"
  | "rss"
  | "settings"
  | "users";

export const ReleaseIcon = IconNotes;
export const IdentityIcon = IconPalette;
export const DashboardIcon = IconLayoutDashboard;
export const SettingsIcon = IconSettings;
export const UsersIcon = IconUsers;
export const DeleteIcon = IconTrash;
export const EditIcon = IconEdit;
export const LinkIcon = IconLink;
export const RssIcon = IconRss;
export const LockIcon = IconLock;

const iconComponents: Record<IconName, IconComponent> = {
  dashboard: DashboardIcon,
  delete: DeleteIcon,
  edit: EditIcon,
  identity: IdentityIcon,
  link: LinkIcon,
  lock: LockIcon,
  release: ReleaseIcon,
  rss: RssIcon,
  settings: SettingsIcon,
  users: UsersIcon,
};

export function getIconComponent(name: IconName) {
  return iconComponents[name];
}
