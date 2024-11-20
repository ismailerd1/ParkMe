import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styles from '../components/homepage.module.css';
import { useNavigate} from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faUser } from '@fortawesome/free-solid-svg-icons';

const stripePromise = loadStripe('pk_test_51PeGp6E3WHExRuYigeZjGH0BWMZLoyKeOsq7pNmT6FlqCQw2UxXvprxbKrwzcImPcxOKtDObGcdz0r18VgiemtCQ007sD7txev');

const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            color: '#32325d',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
                color: '#aab7c4'
            }
        },
        invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
        }
    }
};

const AddCreditForm = () => {
    const navigate = useNavigate();
    const stripe = useStripe();
    const elements = useElements();
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const cuserid = localStorage.getItem('cuserid');
    const [profileData, setProfileData] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    
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

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        const { data: clientSecret } = await axios.post('http://127.0.0.1:8000/api/add-credit/', {
            amount,
            user_id: cuserid  
        });

        const result = await stripe.confirmCardPayment(clientSecret.client_secret, {
            payment_method: {
                card: elements.getElement(CardElement),
                billing_details: {
                    name: 'Your Name',
                },
            },
        });
        
        if (result.error) {
            setMessage(result.error.message);
        } else {
            if (result.paymentIntent.status === 'succeeded') {
                const res = await axios.post('http://127.0.0.1:8000/api/confirm-payment/', {
                    payment_intent_id: result.paymentIntent.id,
                    user_id: cuserid,
                    amount  
                });
                setMessage('Payment succeeded!');
                setAmount('');
                elements.getElement(CardElement).clear();
                
            }
        }
    };

    return (
        <>
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
        <h1 style={{ textAlign: 'center', margin: '5vh auto' }}>Add credit to your account</h1>
        <form onSubmit={handleSubmit} style={{ maxWidth: '50vw', margin: '0 auto' }}>
            <label>
                Amount:
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{
                        display: 'block',
                        width: '100%',
                        padding: '15px',
                        marginBottom: '5vh',
                        fontSize: '1rem',
                        border: '1px solid #ccc',
                        borderRadius: '0.9rem'
                    }}
                />
            </label>
            <CardElement options={CARD_ELEMENT_OPTIONS} />
            <button type="submit" disabled={!stripe} style={{
                display: 'block',
                width: '100%',
                padding: '15px',
                marginTop: '5vh',
                backgroundColor: '#6772e5',
                color: '#fff',
                fontSize: '16px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
            }}>
                Add Credit
            </button>
            {message && <p style={{
                textAlign: 'center',
                fontSize: '2rem',
                margin: '3vh auto'
            }}>{message}</p>}
        </form>
        </>
    );
};

const AddCredit= () => (
    <Elements stripe={stripePromise}>
        <AddCreditForm />
    </Elements>
);

export default AddCredit;