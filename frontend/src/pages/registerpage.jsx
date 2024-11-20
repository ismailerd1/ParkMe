import React, {useState} from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import styles from '../components/registerpage.module.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
      username: '',
      password: '',
    });
    const[error, setError] = useState(null)
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
          ...formData,
          [e.target.name]: e.target.value
        });
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:8000/api/register/', formData)
          .then(response => {
            navigate('/register2', { state: { username: formData.username } });
          })
          .catch(error => {
            console.error('There was an error registering the user!', error);
            console.log(error.response.data.username[0])
            console.log(error.message)
            setError(error.response && error.response.data.username ? error.response.data.username : error.message)
          });
      };

    return(
        <form onSubmit={handleSubmit} className={styles.container}>
            <h1 className={styles.welcome}>Start Register</h1>
            <p className={styles.step}>Step 1/2</p>
            <div className={styles.mailsec}>
                <input className={styles.input} type="text" placeholder="E-mail" name="username" value={formData.username} onChange={handleChange} required />
            </div>
            <div className={styles.passwsec}>
                <input className={styles.input} type="password" placeholder="Password" name="password" value={formData.password} onChange={handleChange} required />
            </div>
            <button type="submit" className={styles.button}>Register</button>

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

export default RegisterPage