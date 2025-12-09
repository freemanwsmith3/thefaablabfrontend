import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import logo from '../../assets/svg/logo.svg';
import Typography from '@mui/material/Typography';

const navItems = [
  // { name: 'This Week', path: '/' },
  { name: 'Auction', path: '/auction' },
  { name: 'Rankings', path: '/rankings' },
  { name: 'Previous Weeks', path: '/history' },
  // { name: 'Previous Weeks', path: '/thisyear' }, make this point to the ThisYear.js 
  { name: 'About', path: '/about' },
];

function Header(props) {
  const navigate = useNavigate();
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleMenuClose();
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar component="nav" sx={{ width: '100%', left: 0, right: 0, backgroundColor: '#035e7b' }}>
        <Toolbar>
        <img 
        src={logo} 
        alt='FAABLab' 
        style={{
          cursor: 'pointer',
          width: '100px', // Reduced from 120px
          height: 'auto', // Maintain aspect ratio
          padding: '8px 0', // Add vertical padding
          display: { xs: 'none', sm: 'block' }
        }}
        onClick={() => navigate(`/`)}
      />
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {navItems.map((item) => (
              <Button key={item.name} sx={{ color: '#fff', fontSize: '1.2rem', padding: '10px 20px' }} onClick={() => handleNavigation(item.path)}>
                {item.name}
              </Button>
            ))}
          </Box>
          <IconButton
            color="inherit"
            aria-label="open menu"
            edge="end"
            onClick={handleMenuOpen}
            sx={{ ml: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              style: {
                width: 'auto',
                minWidth: '200px', // Adjust this value as needed
                maxWidth: '80%', // Prevents menu from being too wide on larger screens
              },
            }}
          >
            {navItems.map((item) => (
              <MenuItem 
                key={item.name} 
                onClick={() => handleNavigation(item.path)}
                style={{
                  justifyContent: 'flex-start',
                  padding: '12px 20px',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.name}
              </MenuItem>
            ))}
          </Menu>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ p: 3 }}>
        <Toolbar />
        <Typography>
        </Typography>
      </Box>
    </Box>
  );
}

export default Header;
