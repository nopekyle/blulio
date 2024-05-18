import React, { useState, useEffect } from "react";
import { Typography, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import Bottom from "./Bottom";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import {
  CloudUploadOutlined,
  HouseOutlined,
  LogoutOutlined,
  NotificationsNoneOutlined,
  Settings,
  SubscriptionsOutlined,
} from "@mui/icons-material";
import SearchText from "./SearchUsers";
import SearchResults from "./Search";

export default function SideBar() {
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();
  const matches = useMediaQuery("(max-width: 800px)");
  const [count, setCount] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getData();
    getNotis();
  }, []);

  const getNotis = async () => {
    if (auth.currentUser) {
      const u = await getDoc(doc(db, "user", auth.currentUser.uid)).catch(
        (e) => {}
      );

      setCount(u.get("notifications"));
    }
  };

  const getData = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        setLoggedIn(true);
        setLoading(false);
      } else {
        setLoggedIn(false);
        setLoading(false);
      }
    });
  };

  if (loading) {
    return <div></div>;
  }

  if (!loggedIn) {
    return (
      <div
        style={{
          width: "300px",
          height: "100%",
          position: "fixed",
          backgroundColor: "#fff",
          display: matches ? "none" : "flex",
          flexDirection: matches ? "row" : "column",
          boxShadow: " 4px 0px 5px 0px rgba(0,0,0,0.2)",
        }}
      >
        <Typography
          onClick={() => navigate("/")}
          fontWeight="bold"
          variant="h4"
          style={{ color: "#000", margin: "20px 10px 20px 10px" }}
        >
          blulio
        </Typography>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "300px",
        height: "100%",
        position: "fixed",
        backgroundColor: "#fff",
        display: matches ? "none" : "flex",
        flexDirection: matches ? "row" : "column",
        boxShadow: " 4px 0px 5px 0px rgba(0,0,0,0.2)",
      }}
    >
      <Typography
        onClick={() => navigate("/")}
        fontWeight="bold"
        variant="h4"
        style={{ color: "#000", margin: "20px" }}
      >
        blulio.
      </Typography>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
          margin: "20px",
        }}
      >
        <HouseOutlined />
        <Typography
          onClick={() => navigate("/")}
          style={{ color: "#000", margin: "10px" }}
        >
          Home
        </Typography>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
          margin: "20px",
        }}
      >
        <CloudUploadOutlined />
        <Typography
          onClick={() => navigate("/upload")}
          style={{ color: "#000", margin: "10px" }}
        >
          Upload
        </Typography>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
          margin: "20px",
        }}
      >
        <NotificationsNoneOutlined />

        <Typography
          onClick={() => {
            navigate("/notifications");
            updateDoc(doc(db, "user", auth.currentUser.uid), {
              notifications: 0,
            }).catch((e) => {});
          }}
          style={{ color: "#000", margin: "10px" }}
        >
          Notifications {count > 0 ? count : null}
        </Typography>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
          margin: "20px",
        }}
      >
        <Settings />
        <Typography
          onClick={() => navigate("/settings")}
          style={{ color: "#000", margin: "10px" }}
        >
          Settings
        </Typography>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
          margin: "20px",
        }}
      >
        <SubscriptionsOutlined />

        <Typography
          onClick={() => navigate("/subscriptions")}
          style={{ color: "#000", margin: "10px" }}
        >
          Subscriptions
        </Typography>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
          margin: "20px",
        }}
      >
        <LogoutOutlined />

        <Typography
          onClick={() => {
            auth.signOut();
            navigate("/login");
          }}
          style={{ color: "#000", margin: "10px" }}
        >
          Sign out
        </Typography>
      </div>

      <div style={{ flexGrow: "1" }}></div>
      <Bottom />
    </div>
  );
}
