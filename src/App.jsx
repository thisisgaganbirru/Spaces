import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Details from "./components/details/Details";
import CardStyles from "./components/CardStyles";
import Home from "./components/home/Home";
import Portfolio from "./components/Portfolio";
import MySpaces from "./components/Spaces";
import SpaceView from "./components/SpaceView"; // Add this import
import Account from "./components/Account";

const App = () => {
  const [userData, setUserData] = useState({});
  const [cardGenerated, setCardGenerated] = useState(false);

  const handleUserDataUpdate = (newUserData) => {
    setUserData(newUserData);
  };

  const handleGenerate = () => {
    setCardGenerated(true);
  };

  return (
    <Router>
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f8f9fa",
        }}
      >
        <Navbar />
        <div
          style={{
            paddingTop: "70px", // Account for sticky navbar
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/portfolio" replace />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/spaces" element={<MySpaces />} />
            <Route path="/spaces/:spaceId" element={<SpaceView />} />
            <Route
              path="/spaces/:parentSlug/:childSlug"
              element={<SpaceView />}
            />
            {/* Nested space route */}
            <Route path="/account" element={<Account />} />
            <Route
              path="/details"
              element={
                <Details
                  userData={userData}
                  onUserDataUpdate={handleUserDataUpdate}
                />
              }
            />
            <Route
              path="/card-styles"
              element={
                <CardStyles userData={userData} onGenerate={handleGenerate} />
              }
            />
            <Route
              path="/home"
              element={
                <Home
                  userData={userData}
                  onGenerate={handleGenerate}
                  cardGenerated={cardGenerated}
                />
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
