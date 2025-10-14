import { Provider } from 'react-redux'
import { store } from './store'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import StudentsSection from './components/StudentsSection'
import ExpensesSection from './components/ExpensesSection'
import StaffSection from './components/StaffSection'
import StaffDetails from './components/StaffDetails'
import ClassesSection from './components/ClassesSection'
import SubsidySection from './components/SubsidySection'
import MarksheetsSection from './components/MarksheetsSection'
import CertificatesSection from './components/CertificatesSection'
import ExaminationSection from './components/ExaminationSection'
import TimeTableSection from './components/timetable/TimeTableSection'
import AdmissionPage from './components/AdmissionPage'
import LoginPage from './components/LoginPage'
import SettingsPage from './components/SettingsPage'
import FeesSection from './components/fees/FeesSection'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'

function App() {
  return (
    <Provider store={store}>
      <Router basename="/sms-sef">
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Layout><Dashboard /></Layout>} />
            <Route path="/students" element={<Layout><StudentsSection /></Layout>} />
            <Route path="/students/admission" element={<Layout><AdmissionPage /></Layout>} />
            <Route path="/fees" element={<Layout><FeesSection /></Layout>} />
            <Route path="/expenses" element={<Layout><ExpensesSection /></Layout>} />
            <Route path="/staff" element={<Layout><StaffSection /></Layout>} />
            <Route path="/staff/:id" element={<Layout><StaffDetails /></Layout>} />
            <Route path="/classes" element={<Layout><ClassesSection /></Layout>} />
            <Route path="/subsidies" element={<Layout><SubsidySection /></Layout>} />
            <Route path="/examinations" element={<Layout><ExaminationSection /></Layout>} />
            <Route path="/marksheets" element={<Layout><MarksheetsSection /></Layout>} />
            <Route path="/certificates" element={<Layout><CertificatesSection /></Layout>} />
            <Route path="/timetable" element={<Layout><TimeTableSection /></Layout>} />
            <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
          </Routes>
          <ToastContainer 
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </Provider>
  )
}

export default App