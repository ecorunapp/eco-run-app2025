import {
  Award,
  AlertCircle,
  AlertTriangle, // Added
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  BadgeCheck,
  BarChart2,
  Bell,
  Bolt,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Circle,
  Clock, // Already exists
  CreditCard,
  Coins,
  Copy,
  DollarSign,
  Dot,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  Flame,
  Footprints,
  Gift,
  GitFork,
  GitPullRequest,
  Github,
  Heart,
  Home,
  Info,
  Languages,
  LayoutDashboard, // Added
  Leaf,
  LifeBuoy,
  Link2,
  Loader2,
  Lock, // Added Lock
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageSquare,
  Minus,
  Moon,
  Nfc,
  Package,
  Palette,
  Pause,
  PenSquare,
  PieChart,
  Play,
  Plus,
  Pointer,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sigma,
  Smile,
  Star,
  StopCircle,
  SunMedium,
  ThumbsUp,
  Trophy,
  Twitter,
  Type,
  User,
  UserCog, // Added
  Users,
  X,
  Zap,
  Weight,
  TrendingUp,
  UploadCloud,
  Activity, // Added Activity
  Route, // Added Route
  type LucideProps,
  type LucideIcon
} from "lucide-react";

// Create a custom Confetti icon
export const Confetti: React.FC<LucideProps> = ({ size = 24, color = "currentColor", ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 7h.01" />
      <path d="M8 3h.01" />
      <path d="M12 5h.01" />
      <path d="M16 3h.01" />
      <path d="M20 7h.01" />
      <path d="M17 17h.01" />
      <path d="M13 19h.01" />
      <path d="M9 17h.01" />
      <path d="M5 19h.01" />
      <path d="M8 12c1.333-1.333 2.667-2 4-2 1.333 0 2.667.667 4 2 1.333 1.333 2.667 2 4 2 1.333 0 2-1 2-3" />
    </svg>
  );
};

// Export all imported icons so they can be used throughout the app
export {
  Award,
  AlertCircle,
  AlertTriangle, // Added
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  BadgeCheck,
  BarChart2,
  Bell,
  Bolt,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Circle,
  Clock, // Already exists
  CreditCard,
  Coins,
  Copy,
  DollarSign,
  Dot,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  Flame,
  Footprints,
  Gift,
  GitFork,
  GitPullRequest,
  Github,
  Heart,
  Home,
  Info,
  Languages,
  LayoutDashboard, // Added
  Leaf,
  LifeBuoy,
  Link2,
  Loader2,
  Lock, // Added Lock to exports
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageSquare,
  Minus,
  Moon,
  Nfc,
  Package,
  Palette,
  Pause,
  PenSquare,
  PieChart,
  Play,
  Plus,
  Pointer,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sigma,
  Smile,
  Star,
  StopCircle,
  SunMedium,
  ThumbsUp,
  Trophy,
  Twitter,
  Type,
  User,
  UserCog, // Added
  Users,
  X,
  Zap,
  Weight,
  TrendingUp,
  UploadCloud,
  Activity, // Added Activity to exports
  Route, // Added Route to exports
  type LucideIcon,
  type LucideProps
  // Confetti is exported at definition
};
