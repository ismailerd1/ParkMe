import React, { useState, useRef, useEffect } from 'react';
import QrScanner from 'react-qr-scanner';
import styles from '../components/parkpage.module.css';
import { useNavigate} from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faUser } from '@fortawesome/free-solid-svg-icons';

const QrScan = () => {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const cuserid = localStorage.getItem('cuserid')
  const [shouldScan, setShouldScan] = useState(false);
  const [error, setError] = useState(null);
  const qrScannerRef = useRef(null);
  const [profileData, setProfileData] = useState(null);
  
  useEffect(() => {
      const fetchProfile = async () => {
          try {
              const cuserid = localStorage.getItem('cuserid');
              const response = await axios.get(`http://127.0.0.1:8000/api/profile/${cuserid}/`);
              console.log(response.data)
              setProfileData(response.data);
          } catch (error) {
              setError('Unable to fetch profile data');
          }
      };
      fetchProfile();
  }, []);

  const handleScan = (data) => {
    if (data) {
      window.location.href = data.text;
    }
  };
  const toggleScanner = () => {
    setShouldScan(!shouldScan);
  };
  const handleError = (error) => {
    setError('There is issue with your camera', error); 
  };
  const previewStyle = {
    height: 240,
    width: 320,
    display: shouldScan ? 'block' : 'none' ,
    marginLeft: 'auto',
    marginRight: 'auto',
  };

  const handleProfileClick = () => {
    const cuserid = localStorage.getItem('cuserid');
    navigate(`/profile/${cuserid}`);
};
const handleHomeClick = () => {
  navigate('/home');
};

const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
};

const closeDrawer = () => {
    setIsDrawerOpen(false);
};

const handleLogout = async () => {
    try {
        await axios.post('http://127.0.0.1:8000/api/logout', {}, );
        localStorage.removeItem('token');
        localStorage.removeItem('cuserid');
        navigate('/login');
    } catch (error) {
        console.error('Logout failed:', error);
    }
};
  return (
    <div>
            <div className={`${styles.drawer} ${isDrawerOpen ? styles.open : ''}`}>
                <div className={styles.drawerClose} onClick={toggleDrawer}>
                    &times;
                </div>
                
                <h1 className={styles.userinfo}>{profileData && profileData.fullname}</h1>
                <h2  className={styles.userinfo}>{profileData && profileData.plate}</h2>
                <br />
                <Link to={`/profile/${cuserid}`} className={styles.clicks}>My account</Link>
                <Link to={'/qrscan'} className={styles.clicks}>Scan Qr</Link>
                <Link to={'/addcredit'} className={styles.clicks}>Add credit</Link>
                <Link to={'/lastparks'} className={styles.clicks}>My last parks</Link>
                <Link to={'/reports'} className={styles.clicks}>Report problem</Link>
                <br />
                <hr className={styles.drwrhr}/>
                <br />
                <Link to={'/createparkspot'} className={styles.clicks}>Create parkspot</Link>
                <Link to={'/ownedparks'} className={styles.clicks}>My parks</Link>
                <Link to={'/reports'} className={styles.clicks}>Report about parks</Link>
                <br />
                <hr className={styles.drwrhr}/> 
                <br />
                <button className={styles.logout} onClick={handleLogout}>Log out</button>
                <h1 className={styles.brand}>ParkMe</h1>
            </div>

            <div 
                className={`${styles.overlay} ${isDrawerOpen ? styles.open : ''}`} 
                onClick={closeDrawer}
            />

            <div className={styles.navbar}>
              <FontAwesomeIcon icon={faBars} className={styles.drawericon} onClick={toggleDrawer} />
              <h1 onClick={handleHomeClick}>ParkMe</h1>
              <FontAwesomeIcon icon={faUser} className={styles.profileicon} onClick={handleProfileClick} />
            </div>
        <div className={styles.flexcntrl}>
        <h1 className={styles.welcome}>QR Code Scan</h1>
        <button className={styles.scancontrol} onClick={toggleScanner}>
          {shouldScan ? 'Stop Scanner' : 'Start Scanner'}
        </button>
        <div style={previewStyle}>
          <QrScanner
            ref={qrScannerRef}
            delay={200}
            onError={handleError}
            onScan={handleScan}
            style={{ width: '100%' }}
          />
        </div>
      {error && <p>{error}</p>}
        </div>
    </div>
  );
};

export default QrScan;