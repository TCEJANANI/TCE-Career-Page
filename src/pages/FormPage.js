import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./FormPage.css";

function FormPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: null, // ✅ track existing record
    email: "",
    name: "",
    phone: "",
    applicantType: "",
    department: "",
    ugPercentage: "",
    pgPercentage: "",
    mastersInstitute: "",
    specialization: "",
    phdInstitute: "",
    phdTopic: "",
    phdStatus: "",
    currentInstitution: "",
    jobTitle: "",
    expAcademics: "",
    expIndustry: "",
    journals: "",
    projects: "",
    placementIncharge: "",
    file: null,
    applicationId: "" // keep applicationId if exists
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value
    }));
  };

  // 🔹 Prefill if email already exists
  const handleEmailBlur = async () => {
    if (!formData.email) return;
    try {
      const res = await fetch(`http://localhost:5007/api/applications/by-email/${formData.email}`);
      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({
          ...prev,
          ...data,
          id: data.id,
          applicationId: data.applicationId,
          file: null
        }));
        alert(`Existing application found! Application ID: ${data.applicationId}. You can update it.`);
      }
    } catch (err) {
      console.error("Error fetching existing application:", err);
    }
  };

  // 🔹 Insert or Update submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formPayload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
  if (key !== "id" && key !== "applicationId") {
    if (key === "file") {
      if (value) formPayload.append("file", value); 
    } else {
      // send "" for text, 0 for numbers
      if (["ugPercentage","pgPercentage","expAcademics","expIndustry","journals","projects"].includes(key)) {
        formPayload.append(key, value || 0);
      } else {
        formPayload.append(key, value || "");
      }
    }
  }
});


      let response;
      if (formData.id) {
        // ✅ Update existing record
        response = await fetch(`http://localhost:5007/api/applications/${formData.id}`, {
          method: "PUT",
          body: formPayload
        });
      } else {
        // ✅ Insert new record
        response = await fetch("http://localhost:5007/api/applications", {
          method: "POST",
          body: formPayload
        });
      }

      const data = await response.json();

      if (!response.ok) {
        alert("Submission failed: " + data.message);
        return;
      }

      navigate("/thankyou", {
        state: { applicationId: data.applicationId || formData.applicationId }
      });

    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Submission failed. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="form-container">
        <h2>Thiagarajar College of Engineering</h2>
        <p className="required-note">* Indicates required question</p>

        <form onSubmit={handleSubmit} className="form-grid">
          <label>
  Email *
  <input
    type="email"
    name="email"
    value={formData.email}
    required
    onChange={handleChange}
    onBlur={handleEmailBlur}
    disabled={!!formData.id}   // ✅ lock email if existing record found
  />
</label>


          <label>
            Name *
            <input
              type="text"
              name="name"
              value={formData.name}
              required
              onChange={handleChange}
            />
          </label>

          <label>
            Phone no *
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              required
              onChange={handleChange}
            />
          </label>

          <fieldset>
            <legend>Are you a Fresher or Experienced? *</legend>
            {["Fresher", "Experienced"].map((type) => (
              <label key={type}>
                <input
                  type="radio"
                  name="applicantType"
                  value={type}
                  checked={formData.applicantType === type}
                  required
                  onChange={handleChange}
                />{" "}
                {type}
              </label>
            ))}
          </fieldset>

          <label>
            Department Applied For *
            <select
              name="department"
              value={formData.department}
              required
              onChange={handleChange}
            >
              <option value="">Select Department</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="MECH">Mechanical</option>
              <option value="CIVIL">Civil</option>
              <option value="IT">IT</option>
              <option value="Mechatronics">Mechatronics</option>
              <option value="MSc.Data Science">MSc.Data Science</option>
              <option value="CSE AIML">CSE AI/ML</option>
              <option value="CSBS">CSBS</option>
              <option value="MCA">MCA</option>
              <option value="B.Arch">B.Arch</option>
              <option value="B.Des.Interior Design">B.Des.Interior Design</option>
              <option value="M.Plan">M.Plan</option>
            </select>
          </label>

          <label>
            UG Percentage *
            <input
              type="number"
              step="0.01"
              name="ugPercentage"
              value={formData.ugPercentage}
              required
              onChange={handleChange}
            />
          </label>

          <label>
            PG Percentage *
            <input
              type="number"
              step="0.01"
              name="pgPercentage"
              value={formData.pgPercentage}
              required
              onChange={handleChange}
            />
          </label>

          <label>
            Pursued Masters Degree in the Institute *
            <input
              type="text"
              name="mastersInstitute"
              value={formData.mastersInstitute}
              required
              onChange={handleChange}
            />
          </label>

          <label>
            M.E/M.Tech Area of Specialization *
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              required
              onChange={handleChange}
            />
          </label>

          {formData.applicantType === "Experienced" && (
            <>
              <label>
                Pursued/Pursuing Ph.D in the Institute
                <input
                  type="text"
                  name="phdInstitute"
                  value={formData.phdInstitute}
                  onChange={handleChange}
                />
              </label>

              <label>
                Ph.D Research Topic
                <input
                  type="text"
                  name="phdTopic"
                  value={formData.phdTopic}
                  onChange={handleChange}
                />
              </label>

              <fieldset>
                <legend>Ph.D Status</legend>
                {["Completed", "Comprehension completed", "Thesis Submitted", "Viva completed", "Other"].map(
                  (status) => (
                    <label key={status}>
                      <input
                        type="radio"
                        name="phdStatus"
                        value={status}
                        checked={formData.phdStatus === status}
                        onChange={handleChange}
                      />{" "}
                      {status}
                    </label>
                  )
                )}
              </fieldset>

              <label>
                Name of your Current Institution
                <input
                  type="text"
                  name="currentInstitution"
                  value={formData.currentInstitution}
                  onChange={handleChange}
                />
              </label>

              <label>
                Current Job Title
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                />
              </label>

              <label>
                Years of Experience (Academics)
                <input
                  type="number"
                  name="expAcademics"
                  value={formData.expAcademics}
                  onChange={handleChange}
                />
              </label>

              <label>
                Years of Experience (Industry)
                <input
                  type="number"
                  name="expIndustry"
                  value={formData.expIndustry}
                  onChange={handleChange}
                />
              </label>

              <label>
                No of Journals (SCI/Scopus...)
                <input
                  type="number"
                  name="journals"
                  value={formData.journals}
                  onChange={handleChange}
                />
              </label>

              <label>
                No of Sponsored R&D Projects
                <input
                  type="number"
                  name="projects"
                  value={formData.projects}
                  onChange={handleChange}
                />
              </label>

              <fieldset>
                <legend>Have been a Placement in-charge in the previous institution</legend>
                {["Yes", "No"].map((option) => (
                  <label key={option}>
                    <input
                      type="radio"
                      name="placementIncharge"
                      value={option}
                      checked={formData.placementIncharge === option}
                      onChange={handleChange}
                    />{" "}
                    {option}
                  </label>
                ))}
              </fieldset>
            </>
          )}

          <label>
            Upload Resume (PDF) *
            {formData.filePath && (
             <p>
             📄 Existing Resume:{" "}
             <a
             href={`http://localhost:5007${formData.filePath}`}
             target="_blank"
             rel="noopener noreferrer"
             >
            {formData.fileName || "Download"}
            </a>
            </p>
            )}
            <input
              type="file"
              name="file"
              accept="application/pdf"
              onChange={handleChange}
            />
          </label>

          <button type="submit" className="submit-btn">
            {formData.id ? "Update Application" : "Submit"}
          </button>
        </form>
      </div>
    </>
  );
}

export default FormPage;
