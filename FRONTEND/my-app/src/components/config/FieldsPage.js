

import axios from "axios";
import { useEffect, useState } from "react";
import { FaSave } from "react-icons/fa";

const BASE = process.env.REACT_APP_BACKEND_URL;

export default function FieldsPage() {

  const [forms,setForms] = useState([]);
  const [components,setComponents] = useState([]);
  const [schemaFields,setSchemaFields] = useState([]);

  const [formId,setFormId] = useState("");
  const [compId,setCompId] = useState("");

  const [selected,setSelected] = useState({});

  // ---------------- LOAD FORMS ----------------
  useEffect(()=>{
    axios.get(`${BASE}/config/forms`)
      .then(r => setForms(r.data || []));
  },[]);

  // ---------------- LOAD COMPONENTS ----------------
  const loadComponents = async (id)=>{
    setFormId(id);
    setCompId("");
    setSchemaFields([]);
    setSelected({});

    const r = await axios.get(`${BASE}/config/components/${id}`);
    setComponents(r.data || []);
  };

  // ---------------- LOAD SCHEMA ----------------
  const loadSchema = async ()=>{
    if (!formId) return alert("Select form");

    const r = await axios.get(
      `${BASE}/config/schema-fields/${formId}`
    );

    setSchemaFields(r.data);
  };

  // ---------------- SELECT ----------------
  const toggle = (name)=>{
    setSelected(s => ({
      ...s,
      [name]: !s[name]
    }));
  };

  // ---------------- CHANGE FIELD PROP ----------------
  const change = (i,key,val)=>{
    const copy = [...schemaFields];
    copy[i][key] = val;
    setSchemaFields(copy);
  };

  // ---------------- SAVE ----------------
  const save = async ()=>{

    if (!compId) return alert("Select component");

    const rows = schemaFields.filter(f => selected[f.field_name]);

    if (!rows.length)
      return alert("Select fields");

    await axios.post(`${BASE}/config/fields/bulk`,{
      component_id: compId,
      fields: rows
    });

    alert("Fields mapped from schema");
  };

  // ---------------- UI ----------------
  return (
  <div className="card shadow">

    <div className="card-header bg-dark text-white">
      Schema Field Mapper
    </div>

    <div className="card-body">

      {/* FORM */}
      <select
        className="form-select mb-3"
        onChange={e => loadComponents(e.target.value)}
      >
        <option value="">Select Form</option>
        {forms.map(f=>(
          <option key={f.form_id} value={f.form_id}>
            {f.form_name}
          </option>
        ))}
      </select>

      {/* COMPONENT */}
      <select
        className="form-select mb-3"
        onChange={e => setCompId(e.target.value)}
      >
        <option value="">Select Component</option>
        {components.map(c=>(
          <option key={c.component_id} value={c.component_id}>
            {c.component_name}
          </option>
        ))}
      </select>

      {/* LOAD SCHEMA */}
      <button
        className="btn btn-warning mb-3"
        onClick={loadSchema}
      >
        Load Fields From Table Schema
      </button>

      {/* TABLE */}
      <div style={{maxHeight:480,overflowY:"auto"}}>
      <table className="table table-sm table-bordered">

        <thead>
          <tr>
            <th></th>
            <th>Column</th>
            <th>Label</th>
            <th>Type</th>
            <th>Required</th>
            <th>Auto</th>
            <th>Dropdown Master</th>
            <th>Span</th>
          </tr>
        </thead>

        <tbody>
        {schemaFields.map((f,i)=>(
          <tr key={i}>

            {/* select */}
            <td>
              <input
                type="checkbox"
                checked={!!selected[f.field_name]}
                onChange={()=>toggle(f.field_name)}
              />
            </td>

            <td>{f.field_name}</td>

            {/* label */}
            <td>
              <input
                className="form-control form-control-sm"
                value={f.field_label}
                onChange={e=>change(i,"field_label",e.target.value)}
              />
            </td>

            {/* type */}
            <td>
              <select
                className="form-select form-select-sm"
                value={f.field_type}
                onChange={e=>change(i,"field_type",e.target.value)}
              >
                <option value="text">text</option>
                <option value="number">number</option>
                <option value="date">date</option>
                <option value="checkbox">checkbox</option>
                <option value="dropdown">dropdown</option>
              </select>
            </td>

            {/* required */}
            <td>
              <input type="checkbox"
                checked={f.is_required}
                onChange={e=>change(i,"is_required",e.target.checked)}
              />
            </td>

            {/* is_auto */}
            <td>
              <input type="checkbox"
                checked={f.is_auto}
                onChange={e=>change(i,"is_auto",e.target.checked)}
              />
            </td>

            {/* dropdown source */}
            <td style={{minWidth:180}}>
              {f.field_type === "dropdown" && (
                <select
                  className="form-select form-select-sm"
                  value={f.dropdown_form_id || ""}
                  onChange={e=>
                    change(i,"dropdown_form_id",e.target.value)
                  }
                >
                  <option value="">Select Master</option>
                  {forms
                    .filter(x => x.form_type === "MASTER")
                    .map(m=>(
                      <option key={m.form_id} value={m.form_id}>
                        {m.form_name}
                      </option>
                  ))}
                </select>
              )}
            </td>

            {/* span */}
            <td style={{width:90}}>
              <input type="number"
                className="form-control form-control-sm"
                value={f.col_span}
                onChange={e=>change(i,"col_span",e.target.value)}
              />
            </td>

          </tr>
        ))}
        </tbody>

      </table>
      </div>

      <button
        className="btn btn-success mt-3"
        onClick={save}
      >
        <FaSave/> Save Selected Fields
      </button>

    </div>
  </div>
  );
}

