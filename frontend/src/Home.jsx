import ract from 'react'
import {useNavigate, Link} from 'react-router-dom'
import {useState, useEffect} from 'react'

function Home() {
    const navigate = useNavigate()
    return(
      <>
        <h1> Hello world</h1>
        <button onClick={navigate("/login")}> Get Started</button>
        <button onClick={() => navigate("/login")} >Get Started</button>
      </>
    )
}
export default Home
