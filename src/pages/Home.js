// src/pages/Home.js
import React from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import "./Home.css";
import collegeBg from "../assets/college-bg.jpeg"; // background image

function Home() {
  return (
    <>
      <Navbar />
      <header
        className="hero"
        style={{ backgroundImage: `url(${collegeBg})` }}
      >
        <div className="overlay">
          <div className="hero-text">
            <h1>Welcome to the Faculty Recruitment Portal</h1>
            <p>Join our esteemed institution and shape the future of education.</p>
            <Link to="/form" className="apply-btn">Apply Now</Link>
          </div>
        </div>
      </header>

      <section className="info-section">
        <h2>About the Recruitment</h2>
        <p>
          Apply for open faculty positions in various departments. Submit your details
          and be part of our academic journey.
        </p>
      </section>
    </>
  );
}

export default Home;
