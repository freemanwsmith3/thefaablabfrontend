import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/svg/logo.svg';
import './header.css';

const Header = ({ currentWk })=> {
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleDropdownToggle = () => {
        setShowDropdown(!showDropdown);
    };

    const handleDropdownClick = (week) => {
        navigate(`/history/${week}`);
        setShowDropdown(false);
    };

    const pastWeeks = Math.max(0, currentWk - 27); // Calculate the number of past weeks, ensuring it's not negative

    return (
        <div className='faab-container'>
            <div className='navCard'>
                <div className='navCardleft'>
                    <img src={logo} alt='FAABLab' className='' onClick={() => navigate(`/`)} />
                </div>
                <div className='navCardright'>
                    <ul>
                        {pastWeeks > 0 && (
                            <li className='dropdown' onClick={handleDropdownToggle}>
                                Past Weeks ▼
                                {showDropdown && (
                                    <ul className='dropdown-menu'>
                                        {[...Array(pastWeeks).keys()].map((week) => (
                                            <li key={week} onClick={() => handleDropdownClick(week + 1)}>
                                                Week {week + 1}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Header;
