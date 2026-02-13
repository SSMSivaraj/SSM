import express from "express";
import { getPool, sql } from "../db.js";

const router = express.Router();

/* ============================
   FORMS CRUD
============================ */

router.get("/forms", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .query("SELECT * FROM NW_forms ORDER BY form_id DESC");

    res.json(result?.recordset || []);

  } catch (err) {
    console.error("Forms fetch error:", err);
    res.status(500).json({ message: "Failed to fetch forms" });
  }
});


router.post("/forms", async (req, res) => {
  try {
    const f = req?.body || {};
    const pool = await getPool();

    await pool.request()
      .input("form_code", sql.VarChar(50), f?.form_code || null)
      .input("form_name", sql.VarChar(200), f?.form_name || null)
      .input("form_type", sql.VarChar(50), f?.form_type || null)
      .input("table_name", sql.VarChar(200), f?.table_name || null)
      .input("primary_key_column", sql.VarChar(100), f?.primary_key_column || null)
      .input("display_column", sql.VarChar(100), f?.display_column || null)
      .query(`
        INSERT INTO NW_forms
        (form_code,form_name,form_type,table_name,primary_key_column,display_column)
        VALUES
        (@form_code,@form_name,@form_type,@table_name,@primary_key_column,@display_column)
      `);

    res.status(201).json({ message: "Inserted" });

  } catch (err) {
    console.error("Forms insert error:", err);
    res.status(500).json({ message: "Insert failed" });
  }
});


router.put("/forms/:id", async (req, res) => {
  try {
    const id = parseInt(req?.params?.id);
    if (!id) return res.status(400).json({ message: "Invalid id" });

    const f = req?.body || {};
    const pool = await getPool();

    await pool.request()
      .input("id", sql.Int, id)
      .input("form_name", sql.VarChar(200), f?.form_name || null)
      .input("form_type", sql.VarChar(50), f?.form_type || null)
      .input("table_name", sql.VarChar(200), f?.table_name || null)
      .input("display_column", sql.VarChar(100), f?.display_column || null)
      .query(`
        UPDATE NW_forms SET
          form_name=@form_name,
          form_type=@form_type,
          table_name=@table_name,
          display_column=@display_column
        WHERE form_id=@id
      `);

    res.json({ message: "Updated" });

  } catch (err) {
    console.error("Forms update error:", err);
    res.status(500).json({ message: "Update failed" });
  }
});


router.delete("/forms/:id", async (req, res) => {
  try {
    const id = parseInt(req?.params?.id);
    if (!id) return res.status(400).json({ message: "Invalid id" });

    const pool = await getPool();

    await pool.request()
      .input("id", sql.Int, id)
      .query("DELETE FROM NW_forms WHERE form_id=@id");

    res.json({ message: "Deleted" });

  } catch (err) {
    console.error("Forms delete error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});


/* ============================
   componnets 
============================ */
router.get("/components/:form_id", async (req, res) => {
  try {
    const id = parseInt(req?.params?.form_id);
    const pool = await getPool();

    const result = await pool.request()
      .input("id", sql.Int, id)
      .query(`
        SELECT * FROM NW_form_components
        WHERE form_id=@id
        ORDER BY component_order
      `);

    res.json(result?.recordset || []);

  } catch (err) {
    console.error("Components fetch error:", err);
    res.status(500).json({ message: "Fetch failed" });
  }
});


router.post("/components", async (req, res) => {
  try {
    const c = req?.body || {};
    const pool = await getPool();

    await pool.request()
      .input("form_id", sql.Int, c?.form_id)
      .input("component_name", sql.VarChar(200), c?.component_name || null)
      .input("component_order", sql.Int, c?.component_order || 0)
      .input("layout_type", sql.VarChar(50), c?.layout_type || null)
      .query(`
        INSERT INTO NW_form_components
        (form_id,component_name,component_order,layout_type)
        VALUES
        (@form_id,@component_name,@component_order,@layout_type)
      `);

    res.status(201).json({ message: "Inserted" });

  } catch (err) {
    console.error("Component insert error:", err);
    res.status(500).json({ message: "Insert failed" });
  }
});


router.delete("/components/:id", async (req, res) => {
  try {
    const id = parseInt(req?.params?.id);
    const pool = await getPool();

    await pool.request()
      .input("id", sql.Int, id)
      .query("DELETE FROM NW_form_components WHERE component_id=@id");

    res.json({ message: "Deleted" });

  } catch (err) {
    console.error("Component delete error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});


/* ============================
FIELDS 
============================ */
router.get("/fields/:component_id", async (req, res) => {
  try {
    const id = parseInt(req?.params?.component_id);
    const pool = await getPool();

    const result = await pool.request()
      .input("id", sql.Int, id)
      .query(`
        SELECT * FROM NW_form_fields
        WHERE component_id=@id
        ORDER BY field_order
      `);

    res.json(result?.recordset || []);

  } catch (err) {
    console.error("Fields fetch error:", err);
    res.status(500).json({ message: "Fetch failed" });
  }
});


router.get("/field-templates", async (req,res)=>{
 try{
   const pool = await getPool();

   const r = await pool.request().query(`
     SELECT *
     FROM NW_form_fields
     WHERE is_template = 1
     ORDER BY field_label
   `);

   res.json(r.recordset);

 }catch(e){
   res.status(500).json({message:"Template fetch failed"});
 }
});


router.delete("/fields/:id", async (req, res) => {
  try {
    const id = parseInt(req?.params?.id);
    const pool = await getPool();

    await pool.request()
      .input("id", sql.Int, id)
      .query("DELETE FROM NW_form_fields WHERE field_id=@id");

    res.json({ message: "Deleted" });

  } catch (err) {
    console.error("Field delete error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});

router.post("/fields/bulk", async (req,res)=>{
 const { component_id, fields } = req.body;
 const pool = await getPool();

 for (const f of fields){
   await pool.request()
    .input("component_id", sql.Int, component_id)
    .input("field_name", sql.VarChar, f.field_name)
    .input("field_label", sql.VarChar, f.field_label)
    .input("field_type", sql.VarChar, f.field_type)
    .input("placeholder", sql.VarChar, f.placeholder)
    .input("default_value", sql.VarChar, f.default_value)
    .input("col_span", sql.Int, f.col_span)
    .input("is_required", sql.Bit, f.is_required)
    .input("is_unique", sql.Bit, f.is_unique)
    .input("is_readonly", sql.Bit, f.is_readonly)
    .input("dropdown_form_id", sql.Int, f.dropdown_form_id || null)
    .input("is_auto", sql.Bit, f.is_auto ? 1 : 0)
    .input("is_template", sql.Bit, f.is_template ? 1 : 0)


    .query(`
     INSERT INTO NW_form_fields
     (component_id,field_name,field_label,field_type,
      placeholder,default_value,col_span,
      is_required,is_unique,is_readonly,dropdown_form_id,is_template,is_auto)
     VALUES
     (@component_id,@field_name,@field_label,@field_type,
      @placeholder,@default_value,@col_span,
      @is_required,@is_unique,@is_readonly,@dropdown_form_id,@is_template,@is_auto)
    `);
 }

 res.json({ok:true});
});


router.get("/:formId/structure", async (req, res) => {
  try {
    const pool = await getPool();
    const { formId } = req.params;

    const result = await pool.request()
      .input("formId", sql.Int, formId)
      .query(`
        SELECT
          fm.form_id,
          fm.form_name,
          fm.form_type,

          c.component_id,
          c.component_name,
          c.component_order,
          c.layout_type,

          f.field_id,
          f.field_name,
          f.field_label,
          f.field_type,
          f.col_span,
          f.field_order,
          f.is_required,
          f.is_auto,
          f.dropdown_form_id

        FROM NW_forms fm
        JOIN NW_form_components c
          ON c.form_id = fm.form_id

        JOIN NW_form_fields f
          ON f.component_id = c.component_id

        WHERE fm.form_id = @formId
          AND f.is_active = 1

        ORDER BY c.component_order, f.field_order
      `);

    const rows = result.recordset;

    if (!rows.length) {
      return res.json({ components: [] });
    }

    // ✅ group by component_id
    const compMap = {};

    rows.forEach(r => {
      if (!compMap[r.component_id]) {
        compMap[r.component_id] = {
          component_id: r.component_id,
          component_name: r.component_name,
          layout_type: r.layout_type,
          component_order: r.component_order,
          fields: []
        };
      }

      compMap[r.component_id].fields.push({
        field_id: r.field_id,
        field_name: r.field_name,
        field_label: r.field_label,
        field_type: r.field_type,
        col_span: r.col_span,
        field_order: r.field_order,
        is_required: r.is_required,
        dropdown_form_id: r.dropdown_form_id,
        is_auto: r.is_auto
  
      });
    });

    res.json({
      form_id: rows[0].form_id,
      form_name: rows[0].form_name,
      form_type: rows[0].form_type,
      components: Object.values(compMap)
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Structure load failed");
  }
});

router.get("/next-value/:formId/:field", async (req, res) => {

  const pool = await getPool();

  const form = await pool.request()
    .input("id", sql.Int, req.params.formId)
    .query(`
      SELECT table_name
      FROM NW_forms
      WHERE form_id=@id
    `);

    console.log("FORM Backend =", form);
  if (!form.recordset.length)
    return res.status(404).send("Form not found");

  const table = form.recordset[0].table_name;
  const field = req.params.field;

  console.log("TABLE =", table, "FIELD =", field);

  const result = await pool.request().query(`
    SELECT ISNULL(MAX(${field}),0) + 1 as nextval
    FROM ${table}
  `);

  res.json({ next: result.recordset[0].nextval });

});

// fields option values for dropdown
router.get("/master/:formId/options", async (req, res) => {

  const pool = await getPool();

  const form = await pool.request()
    .input("id", sql.Int, req.params.formId)
    .query(`
      SELECT table_name,
             primary_key_column,
             display_column
      FROM NW_forms
      WHERE form_id=@id
    `);

  const f = form.recordset[0];

  if (!f) {
    return res.status(404).send("Form not found");
  }

  // ✅ split display columns
  const cols = f.display_column.split(",").map(c => c.trim());

  // ✅ build concat expression
  let labelExpr;

  if (cols.length === 1) {
    labelExpr = cols[0];
  } else {
    // CONCAT(col1,'-',col2,'-',col3)
    const concatParts = cols.map(c => `ISNULL(${c},'')`);
    labelExpr = `CONCAT(${concatParts.join(", '-' ,")})`;
  }

  const query = `
    SELECT 
      ${f.primary_key_column} as value,
      ${labelExpr} as label
    FROM ${f.table_name}
    ORDER BY ${cols[0]}
  `;

  const data = await pool.request().query(query);

  res.json(data.recordset);
});


// ============================
// TABLE SCHEMA → FIELD MAP
// ============================
router.get("/schema-fields/:formId", async (req,res)=>{
  try{
    const pool = await getPool();

    // get table name
    const f = await pool.request()
      .input("id", sql.Int, req.params.formId)
      .query(`
        SELECT table_name
        FROM NW_forms
        WHERE form_id=@id
      `);

    if (!f.recordset.length)
      return res.status(404).send("Form not found");

    const table = f.recordset[0].table_name;

    // read schema
    const cols = await pool.request()
      .input("table", sql.VarChar, table)
      .query(`
        SELECT
          COLUMN_NAME,
          DATA_TYPE,
          IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME=@table
        ORDER BY ORDINAL_POSITION
      `);

    // map sql type → field_type
    const mapType = (t)=>{
      t = t.toLowerCase();
      if (t.includes("int") || t==="decimal" || t==="numeric")
        return "number";
      if (t.includes("date") || t.includes("time"))
        return "date";
      if (t === "bit")
        return "checkbox";
      return "text";
    };

    const mapped = cols.recordset
      .filter(c =>
        !["created_at","updated_at","rowversion","timestamp"]
          .includes(c.COLUMN_NAME.toLowerCase())
      )
      .map(c => ({
        field_name: c.COLUMN_NAME,
        field_label: c.COLUMN_NAME.replace(/_/g," "),
        field_type: mapType(c.DATA_TYPE),
        placeholder: "",
        default_value: "",
        col_span: 6,
        dropdown_form_id: null,
        is_required: c.IS_NULLABLE === "NO",
        is_unique: false,
        is_readonly: false,
        is_template: false,
        is_auto: false
      }));

    res.json(mapped);

  }catch(e){
    console.error(e);
    res.status(500).send("Schema read failed");
  }
});


// ============================
// MASTER AND REPORT VALUES CRUD START 
// ============================
router.get("/data/:formId/:id", async (req,res)=>{
 try{
   const pool = await getPool();

   const f = await pool.request()
     .input("id", sql.Int, req.params.formId)
     .query(`
       SELECT table_name, primary_key_column
       FROM NW_forms
       WHERE form_id=@id
     `);

   const form = f.recordset[0];
   if(!form) return res.status(404).send("Form not found");

   const row = await pool.request()
     .input("rid", sql.Int, req.params.id)
     .query(`
       SELECT *
       FROM ${form.table_name}
       WHERE ${form.primary_key_column}=@rid
     `);

   res.json(row.recordset[0]);

 }catch(e){
   res.status(500).send("Row fetch failed");
 }
});


router.get("/report/:formId", async (req,res)=>{
 try{
   const pool = await getPool();

   const f = await pool.request()
     .input("id", sql.Int, req.params.formId)
     .query(`
       SELECT table_name
       FROM NW_forms
       WHERE form_id=@id
     `);

   const table = f.recordset[0].table_name;

   const data = await pool.request()
     .query(`SELECT * FROM ${table}`);

   res.json(data.recordset);

 }catch(e){
   res.status(500).send("Report load failed");
 }
});


router.post("/data/:formId", async (req,res)=>{
 const pool = await getPool();
 const data = req.body;

 const f = await pool.request()
  .input("id", sql.Int, req.params.formId)
  .query(`SELECT table_name FROM NW_forms WHERE form_id=@id`);

 const table = f.recordset[0].table_name;

 const cols = Object.keys(data);
 const vals = cols.map(c => `@${c}`);

 const q = `
 INSERT INTO ${table}
 (${cols.join(",")})
 VALUES
 (${vals.join(",")})
 `;

 const r = pool.request();
 cols.forEach(c => r.input(c, data[c]));

 await r.query(q);

 res.json({ok:true});
});


router.put("/data/:formId/:id", async (req,res)=>{
 const pool = await getPool();
 const data = req.body;

 const f = await pool.request()
  .input("id", sql.Int, req.params.formId)
  .query(`
    SELECT table_name, primary_key_column
    FROM NW_forms WHERE form_id=@id
  `);

 const form = f.recordset[0];

 const sets = Object.keys(data)
   .map(c => `${c}=@${c}`);

 const r = pool.request();
 Object.entries(data).forEach(([k,v])=>r.input(k,v));

 r.input("id", req.params.id);

 await r.query(`
   UPDATE ${form.table_name}
   SET ${sets.join(",")}
   WHERE ${form.primary_key_column}=@id
 `);

 res.json({ok:true});
});

// ============================
// MASTER AND REPORT VALUES CRUD  END 
// ============================



export default router;