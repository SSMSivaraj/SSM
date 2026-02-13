
import { useState } from "react";
import Sidebar from "./components/config/sidebar";
import FormsPage from "./components/config/FormsPage";
import ComponentsPage from "./components/config/ComponentsPage";
import FieldsPage from "./components/config/FieldsPage";
import ReportScreen from "./components/report/ReportScreen";


export default function App() {
  const [page, setPage] = useState("forms");

  return (
    <div className="d-flex">
      <Sidebar setPage={setPage} />

      <div className="flex-grow-1 p-4 bg-light" style={{minHeight:"100vh",width: "1225px"}}>
        {page === "forms" && <FormsPage />}
        {page === "components" && <ComponentsPage />}
        {page === "fields" && <FieldsPage />}
        {page === "cotton" && <ReportScreen formId={4} />}
      </div>
    </div>
  );
}
