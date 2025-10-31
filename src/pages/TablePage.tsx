import React from "react";
import { useNavigate } from "react-router-dom";
import MyTable from "../components/Table/MyTable";
import "./TablePage.css";


const TablePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="table-page">
      <MyTable onBack={() => navigate("/")} />
    </div>
  );
};

export default TablePage;
