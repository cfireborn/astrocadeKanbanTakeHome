
import React from "react";
import KanbanBoard from "../components/KanbanBoard";
import Layout from "../components/Layout";
import { TaskProvider } from "../contexts/TaskContext";

const Index: React.FC = () => {
  return (
    <TaskProvider>
      <Layout>
        <KanbanBoard />
      </Layout>
    </TaskProvider>
  );
};

export default Index;
