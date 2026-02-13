import axios from "axios";
import { useEffect, useState } from "react";
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes } from "react-icons/fa";

const API = `${process.env.REACT_APP_BACKEND_URL}/config/forms`;

export default function FormsPage() {

  const emptyForm = {
    form_code: "",
    form_name: "",
    form_type: "MASTER",
    table_name: "",
    primary_key_column: "",
    display_column: "",
    is_active: true
  };

  const [data, setData] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  // ---------- LOAD ----------
  const load = async () => {
    const r = await axios.get(API);
    setData(r.data || []);
  };

  useEffect(() => { load(); }, []);

  // ---------- SAVE ----------
  const save = async () => {

    if (!form.form_code || !form.form_name || !form.table_name) {
      alert("Required fields missing");
      return;
    }

    if (editId)
      await axios.put(`${API}/${editId}`, form);
    else
      await axios.post(API, form);

    setForm(emptyForm);
    setEditId(null);
    load();
  };

  // ---------- EDIT ----------
  const editRow = (row) => {
    setForm(row);
    setEditId(row.form_id);
  };

  // ---------- DELETE ----------
  const del = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await axios.delete(`${API}/${id}`);
    load();
  };

  // ---------- UI ----------
  return (
    <div className="card shadow-lg">

      <div className="card-header bg-dark text-white">
        Forms Configuration
      </div>

      <div className="card-body">

        {/* ===== FORM ===== */}
        <div className="row g-3 mb-4">

          <div className="col-md-2">
            <label>Code</label>
            <input className="form-control"
              value={form.form_code}
              onChange={e => setForm({ ...form, form_code: e.target.value })}
            />
          </div>

          <div className="col-md-3">
            <label>Name</label>
            <input className="form-control"
              value={form.form_name}
              onChange={e => setForm({ ...form, form_name: e.target.value })}
            />
          </div>

          <div className="col-md-2">
            <label>Type</label>
            <select className="form-select"
              value={form.form_type}
              onChange={e => setForm({ ...form, form_type: e.target.value })}
            >
              <option value="MASTER">MASTER</option>
                   <option value="REPORT">REPORT</option>
              <option value="TRANSACTION">TRANSACTION</option>
              <option value="SETUP">SETUP</option>
          
            </select>
          </div>

          <div className="col-md-3">
            <label>Table Name</label>
            <input className="form-control"
              value={form.table_name}
              onChange={e => setForm({ ...form, table_name: e.target.value })}
            />
          </div>

          <div className="col-md-2">
            <label>Primary Key</label>
            <input className="form-control"
              value={form.primary_key_column}
              onChange={e => setForm({ ...form, primary_key_column: e.target.value })}
            />
          </div>

          <div className="col-md-3">
            <label>Display Column</label>
            <input className="form-control"
              value={form.display_column}
              onChange={e => setForm({ ...form, display_column: e.target.value })}
            />
          </div>

          <div className="col-md-2 d-flex align-items-end">
            <div className="form-check">
              <input type="checkbox"
                className="form-check-input"
                checked={form.is_active}
                onChange={e => setForm({ ...form, is_active: e.target.checked })}
              />
              <label className="form-check-label">Active</label>
            </div>
          </div>

          <div className="col-md-4 d-flex align-items-end gap-2">
            <button className="btn btn-success" onClick={save}>
              {editId ? <FaSave /> : <FaPlus />} {editId ? "Update" : "Add"}
            </button>

            {editId && (
              <button className="btn btn-secondary"
                onClick={() => {
                  setForm(emptyForm);
                  setEditId(null);
                }}>
                <FaTimes /> Cancel
              </button>
            )}
          </div>

        </div>

        {/* ===== TABLE ===== */}
        <table className="table table-bordered table-striped">

          <thead className="table-dark">
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Type</th>
              <th>Table</th>
              <th>PK</th>
              <th>Display</th>
              <th>Status</th>
              <th>Created</th>
              <th width="120">Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.map(row => (
              <tr key={row.form_id}>
                <td>{row.form_code}</td>
                <td>{row.form_name}</td>
                <td>
                  <span className="badge bg-info">{row.form_type}</span>
                </td>
                <td>{row.table_name}</td>
                <td>{row.primary_key_column}</td>
                <td>{row.display_column}</td>
                <td>
                  {row.is_active
                    ? <span className="badge bg-success">Active</span>
                    : <span className="badge bg-secondary">Inactive</span>}
                </td>
                <td>{row.created_at}</td>

                <td className="text-center">
                  <FaEdit
                    className="text-primary me-3"
                    style={{ cursor: "pointer" }}
                    onClick={() => editRow(row)}
                  />
                  <FaTrash
                    className="text-danger"
                    style={{ cursor: "pointer" }}
                    onClick={() => del(row.form_id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>
    </div>
  );
}
