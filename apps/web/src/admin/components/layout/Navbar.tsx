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
        if (path.includes('typography')) return 'TYPOGRAPHY';
        if (path.includes('icons')) return 'ICONS';
        if (path.includes('maps')) return 'MAPS';
        if (path.includes('notifications')) return 'NOTIFICATIONS';
        return 'ADMIN PANEL';
    };

    return (
        // Navbar structure based on _navbar.scss
        // Min-height 53px, padding-top/bottom ~10px
        <nav className="navbar navbar-expand-lg navbar-absolute fixed-top" style={{
            minHeight: '53px',
            paddingTop: '10px',
            paddingBottom: '10px',
            marginBottom: '20px',
            backgroundColor: 'transparent', /* Or #fff if scrolled, keep simple for now */
            borderBottom: 'none',
            boxShadow: 'none',
            position: 'absolute',
            width: '100%',
            zIndex: 1029
        }}>
            <div className="container-fluid" style={{ paddingRight: '15px', paddingLeft: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>

                {/* Navbar Wrapper (Brand + Toggle) */}
                <div className="navbar-wrapper" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <div className="navbar-toggle">
                        <button
                            type="button"
                            className="navbar-toggler"
                            onClick={onToggleSidebar}
                            style={{ border: 0, background: 'transparent', padding: 0, cursor: 'pointer', outline: 'none', marginRight: '15px' }}
                        >
                            <span className="navbar-toggler-bar bar1" style={{ display: 'block', width: '22px', height: '2px', background: '#66615b', marginBottom: '3px' }}></span>
                            <span className="navbar-toggler-bar bar2" style={{ display: 'block', width: '22px', height: '2px', background: '#66615b', marginBottom: '3px' }}></span>
                            <span className="navbar-toggler-bar bar3" style={{ display: 'block', width: '22px', height: '2px', background: '#66615b', marginBottom: '0' }}></span>
                        </button>
                    </div>
                    <a className="navbar-brand" href="#pablo" onClick={(e) => e.preventDefault()} style={{
                        color: '#66615b',
                        textTransform: 'uppercase',
                        fontSize: '20px',
                        fontWeight: 800,
                        lineHeight: '1.625rem',
                        textDecoration: 'none',
                        marginLeft: '10px'
                    }}>
                        {getPageTitle()}
                    </a>
                </div>

                {/* Navbar Collapse (Right Menu) */}
                <div className="collapse navbar-collapse justify-content-end" style={{ display: 'flex', alignItems: 'center' }}>
                    {/* Search Form - simplified */}
                    <form style={{ marginRight: '15px' }}>
                        <div className="input-group no-border" style={{ display: 'flex', alignItems: 'center' }}>
                            <input type="text" className="form-control" placeholder="Search..." style={{
                                background: 'transparent',
                                border: 'none',
                                borderBottom: '1px solid #DDDDDD',
                                borderRadius: 0,
                                color: '#66615b',
                                padding: '10px 10px 10px 5px',
                                height: '40px'
                            }} />
                            <div className="input-group-append">
                                <span className="input-group-text" style={{ background: 'transparent', border: 'none', padding: '10px 0 10px 0' }}>
                                    <Search size={20} color="#66615b" />
                                </span>
                            </div>
                        </div>
                    </form>

                    <ul className="navbar-nav" style={{ flexDirection: 'row', display: 'flex', listStyle: 'none', paddingLeft: 0, marginBottom: 0 }}>
                        <li className="nav-item">
                            <a className="nav-link btn-magnify" href="#pablo" style={{ padding: '10px 15px', color: '#66615b', display: 'block' }}>
                                <i className="nc-icon nc-layout-11"><Settings size={20} /></i>
                                <span className="d-lg-none d-md-block" style={{ display: 'none' }}>Stats</span>
                            </a>
                        </li>
                        <li className="nav-item btn-rotate dropdown">
                            <a className="nav-link dropdown-toggle" href="#" style={{ padding: '10px 15px', color: '#66615b', display: 'block' }}>
                                <Bell size={20} />
                                <span className="d-lg-none d-md-block" style={{ display: 'none' }}>Notifications</span>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link btn-rotate" href="#pablo" style={{ padding: '10px 15px', color: '#66615b', display: 'block' }}>
                                <Settings size={20} />
                                <span className="d-lg-none d-md-block" style={{ display: 'none' }}>Settings</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
