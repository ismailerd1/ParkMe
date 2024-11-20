import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../components/parkpage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faUser } from '@fortawesome/free-solid-svg-icons';

const LastParks = () => {
    const [parkspots, setParkspots] = useState([]);
    const navigate = useNavigate();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [error, setError] = useState(null); 
    const cuserid = localStorage.getItem('cuserid');
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        const fetchParkspots = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/last-parks/${cuserid}/`);
                setParkspots(response.data);
                console.log(response.data)
                console.log(response.data.parkspots)
            } catch (error) {
                setError('Error fetching data');
            }
        };
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
        fetchParkspots();
        
    }, []);

    if (!parkspots) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>; 
    }
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
            {Array.isArray(parkspots) && parkspots.length > 0 ? <h1 className={styles.welcome}>Your last parks</h1>: ''}     
            
            {Array.isArray(parkspots) && parkspots.length > 0 ? (
                <ul>
                    {parkspots.map(parkspot => (
                        <div className={styles.parkcontainer}>
                            <li>
                                <Link to={`/parkspot/${parkspot.parkingspot.id}`} className={styles.infos}>Name: {parkspot.parkingspot.name}</Link>
                                <p className={styles.infos} >Start time: {parkspot.starttime}</p>
                                <p className={styles.infos}>End time: {parkspot.endtime}</p>
                                <p className={styles.infos}>Price: {parkspot.price}</p>
                            </li>
                        </div>
                    ))}
                </ul>
            ) : (
                <h1 className={styles.dontpark}>You dont have park history.</h1>
            )}
        </div>
    );
};

export default LastParks;