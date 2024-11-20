import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import styles from '../components/registerpage.module.css';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:8000/api/login/', formData)
            .then(response => {
                console.log('User logged in successfully', response.data);
                const cuserid = response.data.customuserid;
                    localStorage.setItem('cuserid', cuserid);
                    navigate('/home');                
            })
            .catch(error => {
                console.error('There was an error logging in!', error);
            });
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.welcome}>Login</h1>
            <form onSubmit={handleSubmit}>
                <div className={styles.mailsec}>
                    <input className={styles.input} type="text" placeholder="E-mail" name="username" value={formData.username} onChange={handleChange} required />
                </div>
                <div className={styles.passwsec}>
                    <input className={styles.input} type="password" placeholder="Password" name="password" value={formData.password} onChange={handleChange} required />
                </div>
                <button className={styles.button} type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;