import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/shared/ScrollToTop';

// Landing + profile
import LandingPage            from './pages/LandingPage';
import FreelancerProfilePage  from './pages/FreelancerProfilePage';

// Registration — shared role selection
import RoleSelectionPage      from './pages/RoleSelectionPage';

// Freelancer registration flow
import FreelancerRegisterPage from './pages/FreelancerRegisterPage';
import VerifyEmailPage        from './pages/VerifyEmailPage';
import VerifiedPage           from './pages/VerifiedPage';

// Buyer registration flow
import BuyerRegisterPage      from './pages/BuyerRegisterPage';
import BuyerVerifyEmailPage   from './pages/BuyerVerifyEmailPage';
import BuyerVerifiedPage      from './pages/BuyerVerifiedPage';

// Marketing pages
import HireAgentsPage         from './pages/HireAgentsPage';
import FindWorkPage           from './pages/FindWorkPage';
import AboutPage              from './pages/AboutPage';
import PricingPage            from './pages/PricingPage';
import LoginPage              from './pages/LoginPage';

// Login
import BuyerLoginPage         from './pages/BuyerLoginPage';
import FreelancerLoginPage    from './pages/FreelancerLoginPage';
import ForgotPasswordPage     from './pages/ForgotPasswordPage';

// Dashboards
import FreelancerDashboardPage from './pages/FreelancerDashboardPage';
import BuyerDashboardPage      from './pages/BuyerDashboardPage';

// Job module
import JobCreatePage      from './pages/JobCreatePage';
import JobSuccessPage     from './pages/JobSuccessPage';
import MyJobsPage         from './pages/MyJobsPage';
import DeliveryReviewPage from './pages/DeliveryReviewPage';

// Bid management (Module 3)
import BidReviewPage        from './pages/BidReviewPage';
import PaymentPage          from './pages/PaymentPage';
import PaymentSuccessPage   from './pages/PaymentSuccessPage';
import PaymentFailedPage    from './pages/PaymentFailedPage';
import BuyerPaymentsPage    from './pages/BuyerPaymentsPage';
import BuyerAccountPage        from './pages/BuyerAccountPage';
import BuyerNotificationsPage  from './pages/BuyerNotificationsPage';

// Delivery & approval (Module 4)
import JobCompletePage        from './pages/JobCompletePage';
import RevisionSubmittedPage  from './pages/RevisionSubmittedPage';
import JobCanceledPage        from './pages/JobCanceledPage';
import JobProgressPage        from './pages/JobProgressPage';

// Freelancer dashboard + sub-pages (Module 5)
import FreelancerJobsPage      from './pages/FreelancerJobsPage';
import AgentManagementPage     from './pages/AgentManagementPage';
import BidderAgentConfigPage   from './pages/BidderAgentConfigPage';
import CLIGuidePage            from './pages/CLIGuidePage';
import SettingsPage            from './pages/SettingsPage';
import FreelancerPaymentsPage  from './pages/FreelancerPaymentsPage';
import MyAccountPage           from './pages/MyAccountPage';
import FreelancerNotificationsPage from './pages/FreelancerNotificationsPage';

// 404
import NotFoundPage           from './pages/NotFoundPage';

const App = () => (
  <BrowserRouter>
    <ScrollToTop />
    <Routes>
      {/* Landing */}
      <Route path="/"                              element={<LandingPage />} />
      <Route path="/freelancer/:handle"            element={<FreelancerProfilePage />} />

      {/* Role selection */}
      <Route path="/register"                      element={<RoleSelectionPage />} />

      {/* Freelancer registration */}
      <Route path="/register/freelancer"           element={<FreelancerRegisterPage />} />
      <Route path="/register/freelancer/verify"    element={<VerifyEmailPage />} />
      <Route path="/register/freelancer/verified"  element={<VerifiedPage />} />

      {/* Buyer registration */}
      <Route path="/register/buyer"                element={<BuyerRegisterPage />} />
      <Route path="/register/buyer/verify"         element={<BuyerVerifyEmailPage />} />
      <Route path="/register/buyer/verified"       element={<BuyerVerifiedPage />} />

      {/* Marketing pages */}
      <Route path="/hire-agents"                   element={<HireAgentsPage />} />
      <Route path="/find-work"                     element={<FindWorkPage />} />
      <Route path="/about"                         element={<AboutPage />} />
      <Route path="/pricing"                       element={<PricingPage />} />

      {/* Login */}
      <Route path="/login"                         element={<LoginPage />} />
      <Route path="/login/buyer"                   element={<BuyerLoginPage />} />
      <Route path="/login/freelancer"              element={<FreelancerLoginPage />} />
      <Route path="/forgot-password"               element={<ForgotPasswordPage />} />

      {/* Dashboards */}
      <Route path="/dashboard/freelancer"          element={<FreelancerDashboardPage />} />
      <Route path="/dashboard/buyer"               element={<BuyerDashboardPage />} />

      {/* Job module */}
      <Route path="/payments"                            element={<BuyerPaymentsPage />} />
      <Route path="/account/buyer"                       element={<BuyerAccountPage />} />
      <Route path="/notifications/buyer"                 element={<BuyerNotificationsPage />} />
      <Route path="/jobs/create"                        element={<JobCreatePage />} />
      <Route path="/jobs/job_001/success"               element={<JobSuccessPage />} />
      <Route path="/jobs"                               element={<MyJobsPage />} />
      <Route path="/jobs/:jobId/delivery"               element={<DeliveryReviewPage />} />

      {/* Bid management */}
      <Route path="/jobs/:jobId/bids"                   element={<BidReviewPage />} />
      <Route path="/jobs/:jobId/payment"                element={<PaymentPage />} />
      <Route path="/jobs/:jobId/payment/success"        element={<PaymentSuccessPage />} />
      <Route path="/jobs/:jobId/payment/failed"         element={<PaymentFailedPage />} />

      {/* Delivery & approval */}
      <Route path="/jobs/:jobId/complete"               element={<JobCompletePage />} />
      <Route path="/jobs/:jobId/revision"               element={<RevisionSubmittedPage />} />
      <Route path="/jobs/:jobId/canceled"               element={<JobCanceledPage />} />
      <Route path="/jobs/:jobId/progress"               element={<JobProgressPage />} />

      {/* Freelancer sub-pages */}
      <Route path="/jobs/freelancer"                    element={<FreelancerJobsPage />} />
      <Route path="/agents"                             element={<AgentManagementPage />} />
      <Route path="/configuration"                      element={<BidderAgentConfigPage />} />
      <Route path="/cli-guide"                          element={<CLIGuidePage />} />
      <Route path="/settings"                           element={<SettingsPage />} />
      <Route path="/payments/freelancer"                element={<FreelancerPaymentsPage />} />
      <Route path="/account/freelancer"                 element={<MyAccountPage />} />
      <Route path="/notifications/freelancer"           element={<FreelancerNotificationsPage />} />

      {/* 404 catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
);

export default App;
