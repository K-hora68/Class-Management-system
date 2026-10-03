import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'


function Signup(){
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async(e) =>{
        e.preventDefault()
        const url = 'http://localhost:5000/api/signup'
       try{
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({username, email, password})
                }
                )
                
            const data =  await response.json()
             if(data.success){
                console.log('User registered successfully', response.json)
                navigate('/login')
                    setUsername('')
                    setEmail('')
                    setPassword('')
             }else{
                console.log('User registration failed')
                alert('User registration failed')
             }

            }
        catch(error){
        console.log(error)
       }
            
       
    }
  return(

    <>
     <div className="signup-container">
       <input type="text" 
       placeholder="Username is your admission number" 
       value={username}
       onchange = {(e) => setUsername(e.target.value)}
       
       />
       <input type="email"
        placeholder="Email" 
        value={email}
        onchange = {(e) => setEmail(e.target.value)}
        />
       <input type="password"
       value={password}
       placeholder="Password" 
       onchange = {(e) => setPassword(e.target.value)}
       />
       <button onClick={handleSubmit}>Sign Up</button> 
     </div>
    </>
  )
}
export default Signup