import {
  Bell,
  MessageSquare,
  Calendar,
  ShoppingCart,
  Users,
  BarChart,
  FileText,
  Star,
  LucideIcon,
} from "lucide-react";

// Define the Preferences type
export type Preferences = {
  updates: boolean;
  messages: boolean;
  events: boolean;
  promotions: boolean;
  makkerbors: boolean;
  rangliste: boolean;
  nyheder: boolean;
  turneringer: boolean;
};

// Type for preference configuration
export type PreferenceConfig = {
  [K in keyof Preferences]: {
    label: string;
    icon: LucideIcon;
  };
};

export const preferenceConfig: PreferenceConfig = {
  updates: { label: "Baneopdateringer", icon: Bell },
  messages: { label: "Nye beskeder", icon: MessageSquare },
  events: { label: "Begivenheder", icon: Calendar },
  promotions: { label: "Tilbud og kampagner", icon: ShoppingCart },
  makkerbors: { label: "Makkerbørs", icon: Users },
  rangliste: { label: "Rangliste", icon: BarChart },
  nyheder: { label: "Nyheder", icon: FileText },
  turneringer: { label: "Turneringer", icon: Star },
};
