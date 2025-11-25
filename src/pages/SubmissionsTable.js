import React from "react";

function LoaderRow({ colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} className="center muted">Loading…</td>
    </tr>
  );
}

function EmptyRow({ colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} className="center muted">No records found</td>
    </tr>
  );
}

export default function SubmissionsTable({
  loading,
  rows,
  page,
  pageSize,
  total,
  onPageChange,
  onRowClick
}) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));
  const colSpan = 9; // total columns now (removed Application PDF)

  return (
    <div className="table-wrap">
      <table className="submissions-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Dept</th>
            <th>Specialization</th>
            <th>Ph.D Status</th>
            <th>Job Title</th>
            <th>Submitted</th>
            <th>Resume</th>
          </tr>
        </thead>
        <tbody>
          {loading && <LoaderRow colSpan={colSpan} />}
          {!loading && rows?.length === 0 && <EmptyRow colSpan={colSpan} />}
          {!loading &&
            rows?.map((r, idx) => (
              <tr key={r.id} onClick={() => onRowClick(r)} className="clickable">
                <td>{(page - 1) * pageSize + idx + 1}</td>
                <td>{r.name || "—"}</td>
                <td>{r.email || "—"}</td>
                <td>{r.department || "—"}</td>
                <td>{r.specialization || "—"}</td>
                <td>{r.phdStatus || "—"}</td>
                <td>{r.jobTitle || "—"}</td>
                <td>
  {r.updated_at 
    ? new Date(r.updated_at).toLocaleDateString()
    : (r.created_at ? new Date(r.created_at).toLocaleDateString() : "—")}
</td>

                <td>
                  {r.filePath ? (
                    <a
                      href={`http://localhost:5007${r.filePath}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Resume
                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      <div className="pagination">
        <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Prev
        </button>
        <span>Page {page} / {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
