import axios from "axios";
import { useEffect, useState } from "react";
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes } from "react-icons/fa";

const BASE = process.env.REACT_APP_BACKEND_URL;

export default function ComponentsPage() {

  const empty = {
    component_name: "",
    component_order: 1,
    layout_type: "tab"
  };

  const [forms, setForms] = useState([]);
  const [formId, setFormId] = useState("");
  const [data, setData] = useState([]);
  const [c, setC] = useState(empty);
  const [editId, setEditId] = useState(null);

  // ---------- LOAD FORMS ----------
  useEffect(() => {
    axios.get(`${BASE}/config/forms`)
      .then(r => setForms(r.data || []));
  }, []);

  // ---------- LOAD COMPONENTS ----------
  const load = async (id) => {
    if (!id) return;
    setFormId(id);
    const r = await axios.get(`${BASE}/config/components/${id}`);
    setData(r.data || []);
  };

  // ---------- SAVE ----------
  const save = async () => {
    if (!formId || !c.component_name) {
      alert("Required fields missing");
      return;
    }

    if (editId)
      await axios.put(`${BASE}/config/components/${editId}`, {
        ...c, form_id: formId
      });
    else
      await axios.post(`${BASE}/config/components`, {
        ...c, form_id: formId
      });

    setC(empty);
    setEditId(null);
    load(formId);
  };

  // ---------- EDIT ----------
  const editRow = (row) => {
    setC(row);
    setEditId(row.component_id);
  };

  // ---------- DELETE ----------
  const del = async (id) => {
    if (!window.confirm("Delete component?")) return;
    await axios.delete(`${BASE}/config/components/${id}`);
    load(formId);
  };

  // ---------- UI ----------
  return (
    <div className="card shadow-lg">

      <div className="card-header bg-dark text-white">
        Form Components
      </div>

      <div className="card-body">

        {/* FORM SELECT */}
        <label>Select Form</label>
        <select
          className="form-select mb-3"
          value={formId}
          onChange={e => load(e.target.value)}
        >
          <option value="">Choose...</option>
          {forms.map(f => (
            <option key={f.form_id} value={f.form_id}>
              {f.form_name}
            </option>
          ))}
        </select>

        {/* ADD / EDIT */}
        {formId && (
          <div className="row g-3 mb-4">

            <div className="col-md-4">
              <label>Name</label>
              <input className="form-control"
                value={c.component_name}
                onChange={e =>
                  setC({ ...c, component_name: e.target.value })
                }
              />
            </div>

            <div className="col-md-2">
              <label>Order</label>
              <input type="number"
                className="form-control"
                value={c.component_order}
                onChange={e =>
                  setC({ ...c, component_order: e.target.value })
                }
              />
            </div>

            <div className="col-md-3">
              <label>Layout</label>
              <select className="form-select"
                value={c.layout_type}
                onChange={e =>
                  setC({ ...c, layout_type: e.target.value })
                }
              >
                <option value="tab">Tab</option>
                <option value="stepper">Stepper</option>
                <option value="accordion">Accordion</option>
              </select>
            </div>

            <div className="col-md-3 d-flex align-items-end gap-2">
              <button className="btn btn-success" onClick={save}>
                {editId ? <FaSave /> : <FaPlus />}
                {editId ? " Update" : " Add"}
              </button>

              {editId && (
                <button className="btn btn-secondary"
                  onClick={() => {
                    setC(empty);
                    setEditId(null);
                  }}>
                  <FaTimes /> Cancel
                </button>
              )}
            </div>

          </div>
        )}

        {/* TABLE */}
        <table className="table table-bordered table-striped">

          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Order</th>
              <th>Layout</th>
              <th width="120">Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.map(row => (
              <tr key={row.component_id}>
                <td>{row.component_name}</td>
                <td>{row.component_order}</td>
                <td>
                  <span className="badge bg-secondary">
                    {row.layout_type}
                  </span>
                </td>
                <td>
                  <FaEdit
                    className="text-primary me-3"
                    style={{ cursor: "pointer" }}
                    onClick={() => editRow(row)}
                  />
                  <FaTrash
                    className="text-danger"
                    style={{ cursor: "pointer" }}
                    onClick={() => del(row.component_id)}
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
