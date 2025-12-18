import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Settings } from 'lucide-react';

interface NavbarProps {
    onToggleSidebar?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
    const location = useLocation();

    // Map paths to titles exactly as in routes.js of the template usually
    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('dashboard')) return 'DASHBOARD';
        if (path.includes('user-profile')) return 'USER PROFILE';
        if (path.includes('table')) return 'TABLE LIST';
        if (path.includes('maps')) return 'MAPS';
        if (path.includes('notifications')) return 'NOTIFICATIONS';
        return 'ADMIN PANEL';
    };

    return (
        <nav className="navbar w-full min-h-[53px] py-2 mb-5 bg-transparent border-0 z-[1029] absolute top-0 left-0">
            <div className="container-fluid px-4 flex items-center justify-between w-full">

                {/* Navbar Wrapper (Brand + Toggle) */}
                <div className="navbar-wrapper flex items-center">
                    <div className="navbar-toggle lg:hidden">
                        <button
                            type="button"
                            className="navbar-toggler border-0 bg-transparent p-0 cursor-pointer outline-none mr-4"
                            onClick={onToggleSidebar}
                        >
                            <span className="navbar-toggler-bar bar1 block w-[22px] h-[2px] bg-[#66615b] mb-[3px] rounded-[1px]"></span>
                            <span className="navbar-toggler-bar bar2 block w-[22px] h-[2px] bg-[#66615b] mb-[3px] rounded-[1px]"></span>
                            <span className="navbar-toggler-bar bar3 block w-[22px] h-[2px] bg-[#66615b] mb-0 rounded-[1px]"></span>
                        </button>
                    </div>
                    <a className="navbar-brand text-[#66615b] uppercase text-[20px] font-extrabold leading-[1.625rem] no-underline ml-2" href="#pablo" onClick={(e) => e.preventDefault()}>
                        {getPageTitle()}
                    </a>
                </div>

                {/* Navbar Collapse (Right Menu) */}
                <div className="collapse navbar-collapse hidden lg:flex items-center justify-end">
                    {/* Search Form - simplified */}
                    <form className="mr-4">
                        <div className="input-group no-border flex items-center border-b border-[#DDDDDD]">
                            <input 
                                type="text" 
                                className="form-control bg-transparent border-none text-[#66615b] px-2 py-2 h-10 focus:outline-none placeholder-gray-400" 
                                placeholder="Search..." 
                            />
                            <div className="input-group-append">
                                <span className="input-group-text bg-transparent border-none py-2">
                                    <Search size={20} color="#66615b" />
                                </span>
                            </div>
                        </div>
                    </form>

                    <ul className="navbar-nav flex flex-row list-none pl-0 mb-0 gap-4">
                        <li className="nav-item">
                            <a className="nav-link btn-magnify block py-2 px-3 text-[#66615b] hover:text-paper-primary transition-colors" href="#pablo">
                                <i className="nc-icon nc-layout-11"><Settings size={20} /></i>
                                <span className="hidden d-lg-none d-md-block">Stats</span>
                            </a>
                        </li>
                        <li className="nav-item btn-rotate dropdown">
                            <a className="nav-link dropdown-toggle block py-2 px-3 text-[#66615b] hover:text-paper-primary transition-colors" href="#">
                                <Bell size={20} />
                                <span className="hidden d-lg-none d-md-block">Notifications</span>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link btn-rotate block py-2 px-3 text-[#66615b] hover:text-paper-primary transition-colors" href="#pablo">
                                <Settings size={20} />
                                <span className="hidden d-lg-none d-md-block">Settings</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
