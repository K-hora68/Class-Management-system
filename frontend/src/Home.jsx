import ract from 'react'
import {useNavigate, Link} from 'react-router-dom'
import {useState, useEffect} from 'react'

function Home() {
    const navigate = useNavigate()
    return(
      <>
        <h1> 
          Hello world. Enroll now as as student or a lecturer
        </h1>
        <button onClick={() => navigate("/signup")} >Get Started</button>
      </>
    )
}
export default Home
