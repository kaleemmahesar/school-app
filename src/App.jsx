import { Provider } from 'react-redux'
import { store } from './store'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import StudentsSection from './components/StudentsSection'
import ExpensesSection from './components/ExpensesSection'
import StaffSection from './components/StaffSection'
import ClassesSection from './components/ClassesSection'
import FeesSection from './components/FeesSection'
import MarksheetsSection from './components/MarksheetsSection'
import AdmissionFormPage from './components/AdmissionFormPage'
import './index.css'

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/" element={
              <Layout>
                <Dashboard />
              </Layout>
            } />
            <Route path="/students" element={
              <Layout>
                <StudentsSection />
              </Layout>
            } />
            <Route path="/students/admission" element={
              <Layout>
                <AdmissionFormPage />
              </Layout>
            } />
            <Route path="/expenses" element={
              <Layout>
                <ExpensesSection />
              </Layout>
            } />
            <Route path="/staff" element={
              <Layout>
                <StaffSection />
              </Layout>
            } />
            <Route path="/classes" element={
              <Layout>
                <ClassesSection />
              </Layout>
            } />
            <Route path="/fees" element={
              <Layout>
                <FeesSection />
              </Layout>
            } />
            <Route path="/marksheets" element={
              <Layout>
                <MarksheetsSection />
              </Layout>
            } />
          </Routes>
        </div>
      </Router>
    </Provider>
  )
}

export default App