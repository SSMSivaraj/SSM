
import { useEffect, useState } from "react";
import axios from "axios";

const BASE = process.env.REACT_APP_BACKEND_URL;

export default function DynamicRenderer({ formId, editId, onSaved }) {

  const [components, setComponents] = useState([]);
  const [values, setValues] = useState({});
  const [masterOptions, setMasterOptions] = useState({});

  /* LOAD STRUCTURE */

  useEffect(() => {
    if (!formId) return;

    axios.get(`${BASE}/config/${formId}/structure`)
      .then(r => setComponents(r.data.components || []))
      .catch(err => console.error(err));

  }, [formId]);

  /* LOAD EDIT DATA */

  useEffect(() => {
    if (!editId) {
      setValues({});
      return;
    }

    axios
      .get(`${BASE}/config/data/${formId}/${editId}`)
      .then(r => setValues(r.data || {}));

  }, [editId, formId]);

  /* LOAD DROPDOWNS */

  useEffect(() => {

    components.forEach(comp => {
      comp.fields.forEach(f => {

        if (f.field_type === "dropdown" && f.dropdown_form_id) {

          axios
            .get(`${BASE}/config/master/${f.dropdown_form_id}/options`)
            .then(r => {
              setMasterOptions(prev => ({
                ...prev,
                [f.field_id]: r.data
              }));
            });

        }

      });
    });

  }, [components]);

  /* AUTO VALUES */

  useEffect(() => {

    if (editId) return; // skip on edit

    components.forEach(comp => {
      comp.fields.forEach(f => {

        if (f.is_auto && !values[f.field_name]) {

          axios
            .get(`${BASE}/config/next-value/${formId}/${f.field_name}`)
            .then(r => {
              setValues(v => ({
                ...v,
                [f.field_name]: r.data.next
              }));
            });

        }

      });
    });

  }, [components, formId, editId]);

  /* CHANGE */

  const handleChange = (name, val) => {
    setValues(v => ({ ...v, [name]: val }));
  };

  /* SAVE */

  const save = async () => {
    try {

      if (editId) {
        await axios.put(
          `${BASE}/config/data/${formId}/${editId}`,
          values
        );
        alert("Updated");
      } else {
        await axios.post(
          `${BASE}/config/data/${formId}`,
          values
        );
        alert("Saved");
      }

      onSaved && onSaved();

    } catch (e) {
      alert("Save failed");
      console.error(e);
    }
  };

  /* RENDER FIELD */

  const renderField = f => {

    switch (f.field_type) {

      case "text":
        return (
          <input
            className="form-control"
            value={values[f.field_name] || ""}
            readOnly={f.is_auto}
            onChange={e => handleChange(f.field_name, e.target.value)}
          />
        );

      case "number":
        return (
          <input
            type="number"
            className="form-control"
            value={values[f.field_name] || ""}
            readOnly={f.is_auto}
            onChange={e => handleChange(f.field_name, e.target.value)}
          />
        );

      case "date":
        return (
          <input
            type="date"
            className="form-control"
            value={values[f.field_name] || ""}
            onChange={e => handleChange(f.field_name, e.target.value)}
          />
        );

      case "checkbox":
        return (
          <input
            type="checkbox"
            checked={values[f.field_name] || false}
            onChange={e => handleChange(f.field_name, e.target.checked)}
          />
        );

      case "dropdown":
        return (
          <select
            className="form-select"
            value={values[f.field_name] || ""}
            onChange={e => handleChange(f.field_name, e.target.value)}
          >
            <option value="">Select</option>
            {(masterOptions[f.field_id] || []).map(o => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };

  /* UI */

  return (
    <div className="container">

      {components.map(comp => (

        <div key={comp.component_id} className="card mb-4">

          <div className="card-header fw-bold">
            {comp.component_name}
          </div>

          <div className="card-body">
            <div className="row">

              {comp.fields.map(f => (

                <div
                  key={f.field_id}
                  className={`col-md-${f.col_span || 6} mb-3`}
                >

                  <label className="form-label">
                    {f.field_label}
                    {f.is_required && (
                      <span className="text-danger"> *</span>
                    )}
                  </label>

                  {renderField(f)}

                </div>

              ))}

            </div>
          </div>

        </div>

      ))}

      <div className="text-end mb-3">
        <button className="btn btn-primary" onClick={save}>
          Save
        </button>
      </div>

    </div>
  );
}
