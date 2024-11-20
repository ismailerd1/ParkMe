import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import styles from '../components/parkpage.module.css';
import { useNavigate} from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faUser } from '@fortawesome/free-solid-svg-icons';

const containerStyle = {
    width: '90%',
    height: '60vh',
    marginTop: '3vh',
    marginBottom: '4vh',
    marginLeft: 'auto',
    marginRight: 'auto',
    borderRadius: '10px'
    
  };
  
  const defaultCenter = {
    lat: -3.745,
    lng: -38.523
  };
  
  function CreateParkSpot() {
    const navigate = useNavigate();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const cuserid = localStorage.getItem('cuserid')
    const [formData, setFormData] = useState({
      name: '',
      number: '',
      lat: '',
      lng: '',
      description: '',
      hourlyrate: '',
      capacity: ''
    });
    const [markerPosition, setMarkerPosition] = useState(defaultCenter);
    const [center, setCenter] = useState(defaultCenter);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setCenter(userLocation);
            setMarkerPosition(userLocation);
            setFormData({ ...formData, lat: userLocation.lat, lng: userLocation.lng });
          },
          () => {
            console.error("Error getting user location");
          }
        );
      }
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
  
    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };
  
    const handleMapClick = (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPosition({ lat, lng });
      setFormData({ ...formData, lat, lng });
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await axios.post('http://localhost:8000/api/parkingspots/', formData);
        console.log('Parking spot registration successful', response.data);
        setQrCodeUrl(response.data.qr_code_url);
        setFormData({
          name: '',
          number: '',
          description: '',
          hourlyrate: '',
          capacity: ''
      });
      } catch (error) {
        console.error('Parking spot registration failed', error.response.data);
        console.log(formData)
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
        <h1 className={styles.welcome}>Enter your park informations</h1>
      <form onSubmit={handleSubmit} className={styles.formcontainer}>
        <input className={styles.inputs} type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required/> <br />
        <input className={styles.inputs} type="tel" name="number" placeholder="Number" value={formData.number} pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" onChange={handleChange} required/> <br />
        <textarea className={styles.inputs} name="description" placeholder="Description" value={formData.description} onChange={handleChange} required></textarea> <br />
        <input className={styles.inputs} type="text" name="hourlyrate" placeholder="Hourly Rate" value={formData.hourlyrate} onChange={handleChange} required/> <br />
        <input className={styles.inputs} type="text" name="capacity" placeholder="Capacity" value={formData.capacity} onChange={handleChange} required/> <br />
        <LoadScript googleMapsApiKey="AIzaSyBE-mDsBoegqcG9BfFw207nJm8Owhf_2W8">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={10}
            onClick={handleMapClick}
          >
            <Marker position={markerPosition} />
          </GoogleMap>
        </LoadScript>
        <button className={styles.button} type="submit">Create Parking Spot</button>
        {qrCodeUrl && <h1 className={styles.successMessage}>Your parkspot created!</h1>}
        {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" />}
      </form>
      </div>
    );
  }

export default CreateParkSpot;