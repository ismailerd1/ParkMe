import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import styles from '../components/parkpage.module.css';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faUser } from '@fortawesome/free-solid-svg-icons';


const containerStyle = {
  width: '70%',
  height: '65vh',
  marginTop: '3vh',
  marginBottom: '4vh',
  marginLeft: 'auto',
  marginRight: 'auto',
  borderRadius: '10px'
  };
const ParkDetail = () => {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const cuserid = localStorage.getItem('cuserid')
  const { id } = useParams();
  const [parkingSpot, setParkingSpot] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [spotid, setSpotId] = useState(null);
  const [activepark, setActivePark] = useState(false);
  const [message, setMessage] = useState(null);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchParkingSpot = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/parkingspots/${id}/`);
        setParkingSpot(response.data);
      } catch (error) {
        console.error('Error fetching parking spot:', error);
        setError('Unable to fetch parking spot data');
      }
    };

    const fetchProfile = async () => {
      const cuserid = localStorage.getItem('cuserid');

      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/profile/${cuserid}/`);
        setProfileData(response.data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError('Unable to fetch profile data');
      }
    };

    fetchParkingSpot();
    fetchProfile();
  }, [id]);

  const checkActiveSession = async () => {
    try {
      const { id } = useParams();
      const cuserid = localStorage.getItem('cuserid');
      const response = await axios.get(`http://127.0.0.1:8000/api/active-session/${cuserid}/`);
    
      if (response.data.active && response.data.spotid != id){     
        setHasActiveSession(true);
        setMessage(`You already have an active parking session. Click  `)
        setSpotId(response.data.spotid);
        setActivePark(false);
      }
      else if(response.data.active && response.data.spotid == id){
        setHasActiveSession(true);
        setActivePark(true);
        setSessionId(response.data.session_id)
        setMessage(null)
      }
      else{
        setHasActiveSession(false);
      }

    } catch (error) {
      console.error('Error checking active session:', error);
    }
  };

  checkActiveSession();

  const startSession = async () => {
    try {
      const cuserid = localStorage.getItem('cuserid');
      const response = await axios.post(`http://127.0.0.1:8000/api/start-session/${id}/`, {
        user_id: cuserid
      });
      setSessionId(response.data.session.id);
      console.log(response.data.session.parkingspot.capacity)
       setParkingSpot(prevSpot => ({
        ...prevSpot,
        capacity: response.data.session.parkingspot.capacity  
      })); 
      console.log(response.data.session.id)
      alert('Parking session started');
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const endSession = async () => {
    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/end-session/${sessionId}/`);
      console.log(response.data)
      alert(`Parking session ended. Price: ${response.data.session.price}`);
      setParkingSpot(prevSpot => ({
        ...prevSpot,
        capacity: response.data.session.parkingspot.capacity  
      })); 
      setSessionId(null);
      activepark(false)
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  if (!parkingSpot) {
    return <div>Loading...</div>;
  }

  if (spotid === id){
    setActivePark(true);
    setMessage(null)
  }


  const center = {
    lat: parkingSpot.lat,
    lng: parkingSpot.lng
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
    <div className="park-detail">
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
      <h1 className={styles.welcome}>{parkingSpot.name}</h1>
      <p className={styles.info}>Description: {parkingSpot.description}</p>
      <p className={styles.info}>Hourly Rate: {parkingSpot.hourlyrate}</p>
      <p className={styles.info}>Capacity: {parkingSpot.capacity}</p>

      <div className={styles.qrcontainer}>
        <img className={styles.qrimg} src={parkingSpot.qr_code_url} alt="QR Code"  />
        <a href={parkingSpot.qr_code_url} download>
            <button className={styles.download}>Download Qr</button>
          </a>
      </div>
      <LoadScript googleMapsApiKey="AIzaSyBE-mDsBoegqcG9BfFw207nJm8Owhf_2W8">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={14}
        >
          <Marker
            position={center}
          />
        </GoogleMap>
      </LoadScript>    
      <div className={styles.sessionbuttons}>
        <button onClick={startSession} className={`${hasActiveSession&& parkingSpot.capacity>0 ? styles.disabledButton : styles.startpark}`} >Start Parking</button>
        <button onClick={endSession} className={`${!hasActiveSession || !activepark ? styles.disabledButton : styles.stoppark}`} disabled={!activepark} >End Parking</button>
      </div>
        {message && (
          <div className={styles.activemessage}>
            <p style={{ fontSize:'1.5rem' }}>{message}</p>
            <a href={`http://localhost:5173/parkspot/${spotid}/`} style={{ fontSize:'1.5rem', textDecoration: 'none', color: 'red' }}>here</a>
          </div>
        )}
    </div>
  );
};

export default ParkDetail;

/* disabled={!hasActiveSession || !sessionId}
disabled={activepark && hasActiveSession} */