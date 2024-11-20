import React, {useState} from "react";
import axios from "axios";
import {  useLocation, useNavigate } from 'react-router-dom';
import styles from '../components/registerpage.module.css';

const Register2Page = () => {
    const [formData, setFormData] = useState({
      fullname: '',
      number: '',
      plate: '',
    });
    const navigate = useNavigate();
    const[error, setError] = useState(null)
    const location = useLocation();
    const { username } = location.state || {}; 

    const handleChange = (e) => {
        setFormData({
          ...formData,
          [e.target.name]: e.target.value
        });
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:8000/api/register2/',  { ...formData, username: username })
          .then(response => {
            const cuserid = response.data.id;
            localStorage.setItem('cuserid', cuserid);
            navigate('/home');
          })
          .catch(error => {
            console.error('There was an error registering the user!', error);
            console.log(error.message)
            console.log(error.response)
            if (error.response && error.response.data) {
              setError(error.response.data.detail || error.response.data.number || error.response.data.plate || 'An unexpected error occurred.');
            } else {
              setError('An unexpected error occurred. Please try again later.');
            }
          });
          
      };

    return(
        <form onSubmit={handleSubmit}  className={styles.container}>
            <h1 className={styles.welcome2}>Finish Register</h1>
            <p className={styles.step}>Step 2/2</p>
            <div className={styles.mailsec}>
            <input className={styles.input} type="text" placeholder="Full name" name="fullname" value={formData.fullname} onChange={handleChange} required />
            </div>
            <div className={styles.mailsec}>
            <input className={styles.input} type="tel" placeholder="Phone number" name="number" value={formData.number} pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" onChange={handleChange} required />
            </div>
            <div className={styles.passwsec}>
            <input className={styles.input} type="text" placeholder="License plate" name="plate" value={formData.plate} onChange={handleChange} required />
            </div>
            <button className={styles.button} type="submit">Register</button>
            {error && <p style={{
                textAlign: 'center',
                fontSize: '2rem',
                margin: '3vh auto',
                padding: '1rem',
                fontWeight: 'bolder',
                backgroundColor: 'red',
            }}>{error}</p>}
        </form>
    );
}

export default Register2Page