import logo from "@/assets/logo.png";
import { Bell, Search } from "lucide-react";
import WalletConnect from "./WalletConnect";

const TopBar = () => {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between h-12 md:h-14 px-3 md:px-4 max-w-lg mx-auto">
        <img src={logo} alt="PopUp" className="h-6 md:h-7" />
        <div className="flex items-center gap-1 md:gap-2">
          <WalletConnect />
          <button
            className="p-1.5 md:p-2 rounded-full hover:bg-secondary transition-colors opacity-50 cursor-not-allowed"
            disabled
            title="Search coming soon"
          >
            <Search className="h-4 w-4 md:h-5 md:w-5 text-foreground" />
          </button>
          <button
            className="p-1.5 md:p-2 rounded-full hover:bg-secondary transition-colors opacity-50 cursor-not-allowed"
            disabled
            title="Notifications coming soon"
          >
            <Bell className="h-4 w-4 md:h-5 md:w-5 text-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
