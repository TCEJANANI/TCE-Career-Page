import React from "react";

export default function SubmissionModal({ row, onClose }) {
  if (!row) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Application Details</h3>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="grid-2">
            <div><strong>Name:</strong> {row.name || "—"}</div>
            <div><strong>Email:</strong> {row.email || "—"}</div>
            <div><strong>Phone:</strong> {row.phone || "—"}</div>
            <div><strong>Department:</strong> {row.department || "—"}</div>
            <div><strong>Specialization:</strong> {row.specialization || "—"}</div>
            <div><strong>Ph.D Institute:</strong> {row.phdInstitute || "—"}</div>
            <div><strong>Ph.D Topic:</strong> {row.phdTopic || "—"}</div>
            <div><strong>Ph.D Status:</strong> {row.phdStatus || "—"}</div>
            <div><strong>Current Institution:</strong> {row.currentInstitution || "—"}</div>
            <div><strong>Job Title:</strong> {row.jobTitle || "—"}</div>
            <div><strong>Experience (Academics):</strong> {row.expAcademics || "—"}</div>
            <div><strong>Experience (Industry):</strong> {row.expIndustry || "—"}</div>
            <div><strong>Journals:</strong> {row.journals || "—"}</div>
            <div><strong>Projects:</strong> {row.projects || "—"}</div>
            <div><strong>Placement In-charge:</strong> {row.placementIncharge || "—"}</div>
          </div>

          <div className="download-links">
            <p>
              <strong>Resume:</strong>{" "}
              {row.filePath ? (
                <a
                  href={`http://localhost:5007${row.filePath}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View / Download Resume
                </a>
              ) : (
                "Not uploaded"
              )}
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
