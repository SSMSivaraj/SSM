import { FaWpforms, FaLayerGroup, FaList } from "react-icons/fa";

export default function Sidebar({ setPage }) {
  return (
    <div className="bg-dark text-white p-3 vh-100" style={{ width: 230 }}>
      <h5 className="mb-4">⚙ Form Builder</h5>

      <button className="btn btn-outline-light w-100 mb-2"
        onClick={()=>setPage("forms")}>
        <FaWpforms /> Forms
      </button>

      <button className="btn btn-outline-light w-100 mb-2"
        onClick={()=>setPage("components")}>
        <FaLayerGroup /> Components
      </button>

      <button className="btn btn-outline-light w-100"
        onClick={()=>setPage("fields")}>
        <FaList /> Fields
      </button>

            <button className="btn btn-outline-light w-100"
        onClick={()=>setPage("cotton")}>
        <FaList /> COTTON
      </button>
    </div>
  );
}
