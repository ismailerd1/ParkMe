import React, { useState, useEffect } from 'react';
import { useNavigate} from 'react-router-dom';
import axios from 'axios';
import styles from '../components/homepage.module.css';
import Map from '../components/map';
import qricon from '../components/profile_qr.png';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faUser } from '@fortawesome/free-solid-svg-icons';

const HomePage = () => {
    const navigate = useNavigate();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const cuserid = localStorage.getItem('cuserid')
    const [error, setError] = useState(null);
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
    if (!profileData) {
        return <p>Loading...</p>;
    }

    const qrclick = () => {
        navigate('/qrscan');
    };

    const addcredit = () => {
        navigate('/addcredit');
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
        <div className={styles.container}>
            <div className={`${styles.drawer} ${isDrawerOpen ? styles.open : ''}`}>
                <div className={styles.drawerClose} onClick={toggleDrawer}>
                    &times;
                </div>
                
                <h1 className={styles.userinfo}>{profileData.fullname}</h1>
                <h2  className={styles.userinfo}>{profileData.plate}</h2>
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
            <h1 onClick={handleHomeClick} >ParkMe</h1>
            <FontAwesomeIcon icon={faUser} className={styles.profileicon} onClick={handleProfileClick} />
            </div>

            <div className={styles.maparea}>
                <Map />
            </div>
            <hr className={styles.hr} />

            <div className={styles.qrnavigate}>
                <img className={styles.profileqr} src={qricon} alt="Qr" />
                <button onClick={qrclick} className={styles.scannav}>
                    Scan park Qr
                </button>
            </div>
            <hr className={styles.hr} />

            <div className={styles.creditsec}>
                <h2 className={styles.credititle}>Available credit $</h2>
                <div className={styles.flexsub}>
                    <h1 className={styles.currentcash}> {profileData.credit} </h1>
                    <h3 className={styles.addcash} onClick={addcredit} >Add credit</h3>
                </div>
            </div>
            {error&& 
            <p>error</p>
            }
            <div className={styles.empty}></div>
        </div>
    );
};

export default HomePage;