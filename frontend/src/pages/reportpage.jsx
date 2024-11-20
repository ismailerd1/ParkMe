import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate} from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faUser } from '@fortawesome/free-solid-svg-icons';
import styles from '../components/reportpage.module.css';

const ReportForm = () => {
    const navigate = useNavigate();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const cuserid = localStorage.getItem('cuserid')
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const data = {
            title: title,
            description: description,
            phone_number: phoneNumber,
        };

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/reports/', data);

            if (response.status === 201) {
                setSuccess(true);  
                setTitle('');
                setDescription('');
            }
        } catch (err) {
            setError('An error occurred while submitting the report.');
        } finally {
            setIsLoading(false);
        }
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
        <div className={styles.container}>
            <h2 className={styles.welcome2}>Create a Report</h2>
            {success && <p style={{
                textAlign: 'center',
                fontSize: '2rem',
                margin: '3vh auto',
                padding: '1rem',
                fontWeight: 'bolder',
                backgroundColor: 'green',
            }}>Your report has been successfully submitted!</p>}
            
            {error && <p style={{
                textAlign: 'center',
                fontSize: '2rem',
                margin: '3vh auto',
                padding: '1rem',
                fontWeight: 'bolder',
                backgroundColor: 'red',
            }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div className={styles.mailsec}>
                    <input
                        className={styles.input}
                        type="text"
                        placeholder='Title'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className={styles.mailsec}>
                    <textarea
                        className={styles.input}
                        value={description}
                        placeholder='Description'
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>
                <div className={styles.mailsec}>
                    <input
                        className={styles.input}
                        type="tel"
                        placeholder='Phone number'
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className={styles.button} disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Submit  Report'}
                </button>
            </form>
        </div>
        </div>
    );
};

export default ReportForm;