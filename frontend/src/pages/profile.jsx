import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import styles from '../components/profilepage.module.css';
import { useNavigate} from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faUser } from '@fortawesome/free-solid-svg-icons';

const UserProfile = () => {
    const navigate = useNavigate();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const [isEditing, setIsEditing] = useState(false);
    const [isowner, setIsOwner] = useState(false);
    const cuserid = localStorage.getItem('cuserid');
    const [formData, setFormData] = useState({
        fullname: '',
        number: '',
        plate: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/profile/${id}/`);
                setProfileData(response.data);
            } catch (error) {
                setError('Unable to fetch profile data');
            }
        };
        if(cuserid === id){
            setIsOwner(true);
        }
        fetchProfile();
    }, [id]);

    if (error) {
        return <div>Error: {error}</div>;
    }
    if (!profileData) {
        return <div>Loading...</div>;
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://127.0.0.1:8000/api/profile/${id}/`, formData);
            setProfileData(formData);
            setIsEditing(false);
        } catch (error) {
            setError('Unable to update profile data');
        }
    };

    const handleProfileClick = () => {
        const cuserid = localStorage.getItem('cuserid');
        navigate(`/profile/${cuserid}`);
    };
    const handleHomeClick = () => {
        navigate('/home');
    };
    const addcashf = () => {
        navigate('/addcredit');
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

    return  (
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
                <h1 onClick={handleHomeClick}>ParkMe</h1>
                <FontAwesomeIcon icon={faUser} className={styles.profileicon} onClick={handleProfileClick} />
            </div>
            {isowner? <h1 className={styles.welcome}>My profile</h1>: <h1 className={styles.welcome}>User profile</h1>}
            {isEditing ? (
                <form onSubmit={handleFormSubmit} className={styles.editform}>                  
                        
                        <input
                            className={styles.inputs}
                            placeholder='Full Name'
                            type="text"
                            name="fullname"
                            value={formData.fullname}
                            onChange={handleInputChange}
                        />                    
                    <br />                        
                        <input
                            className={styles.inputs}
                            placeholder='Number'
                            type="text"
                            name="number"
                            value={formData.number}
                            onChange={handleInputChange}
                        />
                    <br />                       
                        <input
                            className={styles.inputs}
                            placeholder='Plate'
                            type="text"
                            name="plate"
                            value={formData.plate}
                            onChange={handleInputChange}
                        />
                     <br />
                </form>
            ) : (
                <div className={styles.infosdiv}>
                    <p className={styles.infos}>Full Name: {profileData.fullname}</p>
                    {isowner &&<p className={styles.infos}>Number: {profileData.number}</p>}
                    <p className={styles.infos}>Plate: {profileData.plate}</p>
                    {isowner && <p>My Credit: {profileData.credit}</p>}
                </div>
            )}
            <div className={styles.buttonsec}>
                {isEditing &&
                    <button className={styles.addcash} type="submit">Save Changes</button>}
                {isowner && !isEditing && (
                    <button className={styles.button} onClick={() => setIsEditing(true)}>Edit Profile</button>
                )}
                {isowner && isEditing && (
                    <button className={styles.addcash} onClick={() => setIsEditing(false)}>Cancel</button>
                )}
                {!isEditing && isowner &&
                    <button onClick={addcashf} className={styles.addcash} >Add Credit</button>}
            </div>
        </div>
    );
};

export default UserProfile;