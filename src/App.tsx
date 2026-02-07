import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConfigProvider } from "antd";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import CourseSessions from "./pages/CourseSessions";
import CourseRuns from "./pages/CourseRuns";
import Trainers from "./pages/Trainers";
import Enrolments from "./pages/Enrolments";
import Assessments from "./pages/Assessments";
import SkillsFramework from "./pages/SkillsFramework";

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1677ff",
          borderRadius: 6,
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/course-sessions" element={<CourseSessions />} />
            <Route path="/course-runs" element={<CourseRuns />} />
            <Route path="/trainers" element={<Trainers />} />
            <Route path="/enrolments" element={<Enrolments />} />
            <Route path="/assessments" element={<Assessments />} />
            <Route path="/skills-framework" element={<SkillsFramework />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
