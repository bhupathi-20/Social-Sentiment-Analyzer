import React from 'react';

const Navbar = () => {
    return (
        <nav className="navbar">
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/about">About Us</a></li>
                {/* <li><a href="/graphs">Graphs</a></li> */}
                {/* <li className="dropdown">
                    <a href="#" className="dropdown-toggle">Filter</a>
                    <ul className="dropdown-menu">
                        <li><a href="#">Option 1</a></li>
                        <li><a href="#">Option 2</a></li>
                        <li><a href="#">Option 3</a></li>
                    </ul>
                </li> */}
            </ul>
        </nav>
    );
};

export default Navbar;