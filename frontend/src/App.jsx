import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import FarmerDashboard from './pages/FarmerDashboard.jsx';
import BuyerMarketplace from './pages/BuyerMarketplace.jsx';
import ListingDetail from './pages/ListingDetail.jsx';
import ListingForm from './pages/ListingForm.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import NotFound from './pages/NotFound.jsx';
import { useAuth } from './shared/AuthContext.jsx';
import Home from './pages/Home.jsx';
import BuyerDashboard from './pages/BuyerDashboard.jsx';
import About from './pages/About.jsx';
import Notifications from './pages/Notifications.jsx';
import Checkout from './pages/Checkout.jsx';
import FarmerKYC from './pages/FarmerKYC.jsx';
import AppLayout from './shared/AppLayout.jsx';
import ListingWizard from './pages/ListingWizard.jsx';
import BuyerOrders from './pages/BuyerOrders.jsx';
import ChatList from './pages/ChatList.jsx';
import Chat from './pages/Chat.jsx';
import ExpertConnect from './pages/ExpertConnect.jsx';
import Cart from './pages/Cart.jsx';

function PrivateRoute({ children, roles }) {
	const { user } = useAuth();
	if (!user) return <Navigate to="/login" replace />;
	if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
	return children;
}

export default function App() {
	return (
		<AppLayout>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/market" element={<BuyerMarketplace />} />
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/listing/:id" element={<ListingDetail />} />
				<Route path="/checkout" element={<Checkout />} />
				<Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
				<Route path="/about" element={<About />} />
				<Route
					path="/farmer"
					element={
						<PrivateRoute roles={["farmer"]}>
							<FarmerDashboard />
						</PrivateRoute>
					}
				/>
				<Route path="/farmer/kyc" element={<PrivateRoute roles={["farmer"]}><FarmerKYC /></PrivateRoute>} />
				<Route
					path="/farmer/new"
					element={
						<PrivateRoute roles={["farmer"]}>
							<ListingWizard />
						</PrivateRoute>
					}
				/>
				<Route path="/buyer" element={<PrivateRoute roles={["buyer"]}><BuyerDashboard /></PrivateRoute>} />
				<Route path="/buyer/orders" element={<PrivateRoute roles={["buyer"]}><BuyerOrders /></PrivateRoute>} />
				<Route path="/chat" element={<PrivateRoute><ChatList /></PrivateRoute>} />
				<Route path="/chat/:chatId" element={<PrivateRoute><Chat /></PrivateRoute>} />
				<Route path="/experts" element={<PrivateRoute><ExpertConnect /></PrivateRoute>} />
				<Route path="/cart" element={<PrivateRoute roles={["buyer"]}><Cart /></PrivateRoute>} />
				<Route
					path="/admin"
					element={
						<PrivateRoute roles={["admin"]}>
							<AdminDashboard />
						</PrivateRoute>
					}
				/>
				<Route path="*" element={<NotFound />} />
			</Routes>
		</AppLayout>
	);
}
