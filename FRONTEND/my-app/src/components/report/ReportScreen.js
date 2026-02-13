
import { useEffect, useState } from "react";
import axios from "axios";
import DynamicRenderer from "./DynamicRenderer";

const BASE = process.env.REACT_APP_BACKEND_URL;

export default function ReportScreen({ formId }) {

  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [visibleCols, setVisibleCols] = useState([]);
  const [filters, setFilters] = useState({});

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  /* ================= LOAD REPORT ================= */

  useEffect(() => {
    if (!formId) return;

    axios.get(`${BASE}/config/report/${formId}`)
      .then(r => {
        const data = r.data || [];
        setRows(data);

        if (data.length) {
          const cols = Object.keys(data[0]);
          setColumns(cols);
          setVisibleCols(cols);
        }
      });

  }, [formId]);

  /* ================= COLUMN TYPE HELPERS ================= */

  const isAmountCol = (c) =>
    /amt|amount|value|val|total|qty|kgs|kg/i.test(c);

  const isDateValue = (v) => {
    if (!v) return false;
    const d = new Date(v);
    return !isNaN(d.getTime());
  };

const formatDate = (v) => {
  if (!isDateValue(v)) return v;
  const d = new Date(v);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};


  const formatCell = (c, v) => {
    if (v == null) return "";

    if (isAmountCol(c) && !isNaN(v)) {
      return Number(v).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }

    if (isDateValue(v)) return formatDate(v);

    return String(v);
  };

  /* ================= FILTER ================= */

  const filtered = rows.filter(r =>
    visibleCols.every(c => {
      const f = filters[c];
      if (!f) return true;
      return String(r[c] ?? "")
        .toLowerCase()
        .includes(f.toLowerCase());
    })
  );

  /* ================= TOTALS (FILTER BASED) ================= */

  const totals = visibleCols.reduce((acc, c) => {
    if (!isAmountCol(c)) return acc;

    acc[c] = filtered.reduce((sum, r) => {
      const n = Number(r[c]);
      return sum + (isNaN(n) ? 0 : n);
    }, 0);

    return acc;
  }, {});

  /* ================= PAGINATION ================= */

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const pagedRows = filtered.slice(start, start + pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [filtered.length]); // eslint-disable-line

  /* ================= ACTIONS ================= */

  const toggleCol = c => {
    setVisibleCols(v =>
      v.includes(c) ? v.filter(x => x !== c) : [...v, c]
    );
  };

  const addNew = () => {
    setEditId(null);
    setShowForm(true);
  };

  const editRow = r => {
    const pk = columns[0];
    setEditId(r.id || r[pk]);
    setShowForm(true);
  };

  const reload = () => {
    axios
      .get(`${BASE}/config/report/${formId}`)
      .then(r => setRows(r.data || []));
  };

  const afterSave = () => {
    setShowForm(false);
    setEditId(null);
    reload();
  };

  /* ================= UI ================= */

  return (
    <div className="container-fluid py-3">

      {/* HEADER */}
      <div className="card shadow-sm mb-3">
        <div className="card-body d-flex justify-content-between align-items-center">

          <div>
            <h5 className="mb-0 fw-bold">📊 Report Viewer</h5>
            <small className="text-muted">View, filter and manage records</small>
          </div>

          <div className="d-flex gap-3 align-items-center">

            <button className="btn btn-success" onClick={addNew}>
              + Add New
            </button>

            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small">Page Size</span>
              <select
                className="form-select form-select-sm"
                style={{ width: 90 }}
                value={pageSize}
                onChange={e => {
                  setPageSize(+e.target.value);
                  setPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

          </div>
        </div>
      </div>

      {/* COLUMN SELECTOR */}
      <div className="card shadow-sm mb-3">
        <div className="card-body">

          <div className="fw-semibold mb-2">Visible Columns</div>

          <div
            className="d-flex flex-wrap gap-3"
            style={{ maxHeight: 120, overflowY: "auto" }}
          >
            {columns.map(c => (
              <label key={c} className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={visibleCols.includes(c)}
                  onChange={() => toggleCol(c)}
                />
                <span className="form-check-label ms-1">{c}</span>
              </label>
            ))}
          </div>

        </div>
      </div>

      {/* TABLE CARD */}
      <div className="card shadow-sm">

        <div
          className="card-body p-0"
          style={{
            maxHeight: 420,
            overflowX: "auto",
            overflowY: "auto"
          }}
        >

          <table
            className="table table-sm table-bordered table-hover mb-0"
            style={{ width: "max-content" }}
          >

            <thead
              className="table-dark"
              style={{ position: "sticky", top: 0, zIndex: 5 }}
            >
              <tr>
                {visibleCols.map(c => (
                  <th
                    key={c}
                    style={{
                      whiteSpace: "nowrap",
                      minWidth: 160,
                      textAlign: isAmountCol(c) ? "right" : "left"
                    }}
                  >
                    {c}
                  </th>
                ))}
              </tr>

              <tr>
                {visibleCols.map(c => (
                  <th key={c} className="bg-light">
                    <input
                      className="form-control form-control-sm"
                      placeholder="Filter..."
                      onChange={e => {
                        setFilters(f => ({ ...f, [c]: e.target.value }));
                        setPage(1);
                      }}
                    />
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {pagedRows.map((r, i) => (
                <tr key={i} onClick={() => editRow(r)} style={{ cursor: "pointer" }}>
                  {visibleCols.map(c => (
                    <td
                      key={c}
                      style={{
                        whiteSpace: "nowrap",
                        minWidth: 160,
                        textAlign: isAmountCol(c) ? "right" : "left"
                      }}
                    >
                      {formatCell(c, r[c])}
                    </td>
                  ))}
                </tr>
              ))}

              {/* TOTAL ROW */}
              <tr className="table-warning fw-bold"  style={{
    position: "sticky",
    bottom: 0,
    background: "#fff3cd",   // same as table-warning
    zIndex: 4
  }}>
                {visibleCols.map(c => (
                  <td
                    key={c}
                    style={{
                      whiteSpace: "nowrap",
                      minWidth: 160,
                      textAlign: isAmountCol(c) ? "right" : "left"
                    }}
                  >
                    {isAmountCol(c)
                      ? totals[c]?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })
                      : ""}
                  </td>
                ))}
              </tr>
            </tbody>

          </table>

        </div>

        {/* PAGINATION */}
        <div className="card-footer bg-white d-flex justify-content-between align-items-center">

          <div className="text-muted small">
            Showing {filtered.length === 0 ? 0 : start + 1} —
            {Math.min(start + pageSize, filtered.length)}
            of {filtered.length}
          </div>

          <div className="btn-group btn-group-sm">

            <button
              className="btn btn-outline-secondary"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, page - 3), page + 2)
              .map(p => (
                <button
                  key={p}
                  className={`btn ${p === page ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}

            <button
              className="btn btn-outline-secondary"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>

          </div>

        </div>

      </div>

      {/* MODAL FORM */}
      {showForm && (
        <div className="modal show d-block">
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">

              <div className="modal-header bg-primary text-white">
                <h5>{editId ? "Update" : "Add"} Record</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowForm(false)}
                />
              </div>

              <div className="modal-body">
                <DynamicRenderer
                  formId={formId}
                  editId={editId}
                  onSaved={afterSave}
                />
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}



