import React from "react";
import { useLocation, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./ThankYou.css";

function ThankYou() {
  const location = useLocation();
  const applicationId = location.state?.applicationId;

  return (
    <>
      <Navbar />
      <div className="thankyou-container">
        <div className="thankyou-card">
          <h1>✅ Application Submitted Successfully</h1>
          {applicationId && (
            <p className="app-id">
              Your Application ID: <strong>{applicationId}</strong>
            </p>
          )}
          <p>
            Thank you for applying to <strong>Thiagarajar College of Engineering</strong>.  
            Your application has been received and will be reviewed by our selection committee.
          </p>
          <p>
            You will be contacted via email if your profile is shortlisted for the next stage.
          </p>
          <Link to="/" className="home-btn">Return to Home</Link>
        </div>
      </div>
    </>
  );
}

export default ThankYou;
