import React, { useState, useEffect } from "react";
import { Drawer, List, Typography, Avatar } from "@mui/material";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function MobileMenu(props) {
  const navigate = useNavigate();

  const db = getFirestore();
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  const getProfile = async () => {
    auth.onAuthStateChanged(async (u) => {
      if (u) {
        let snap = await getDoc(doc(db, "user", auth.currentUser.uid));

        setUser({
          avatar: snap.get("avatar"),
          id: snap.id,
          username: snap.get("username"),
          notifications: snap.get("notifications"),
        });

        setLoading(false);
      } else {
      }
    });
  };

  const getNotis = async () => {
    if (auth.currentUser) {
      const u = await getDoc(doc(db, "user", auth.currentUser.uid)).catch(
        (e) => {}
      );

      setCount(u.get("notifications"));
    }
  };

  useEffect(() => {
    getProfile();
    getNotis();
  }, []);

  if (loading) {
    return <div></div>;
  }

  return (
    <Drawer
      anchor="bottom"
      open={props.open}
      onClose={() => props.setOpen(false)}
    >
      <List>
        <Typography
          style={{ color: "#000", margin: "20px" }}
          onClick={() => navigate("/")}
        >
          Home
        </Typography>
        <Typography
          onClick={() => {
            navigate("/notifications");
            updateDoc(doc(db, "user", auth.currentUser.uid), {
              notifications: 0,
            }).catch((e) => {});
          }}
          style={{ color: "#000", margin: "20px" }}
        >
          Notifications {count > 0 ? count : null}
        </Typography>
        <Typography
          style={{ color: "#000", margin: "20px" }}
          onClick={() => navigate("/settings")}
        >
          Settings
        </Typography>
        <Typography
          style={{ color: "#000", margin: "20px" }}
          onClick={() => navigate("/subscriptions")}
        >
          Subscriptions
        </Typography>
        <Typography
          style={{ color: "#000", margin: "20px" }}
          onClick={() => navigate("/upload")}
        >
          Upload
        </Typography>
        <div style={{ flexGrow: "1" }}></div>
        <div
          onClick={() => navigate(`/${user.username}`)}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            margin: "10px 0 20px 10px",
          }}
        >
          <Avatar
            src={user.avatar}
            style={{ marginRight: "20px", marginLeft: "10px" }}
          ></Avatar>
          <Typography style={{ color: "#000" }}>{user.username}</Typography>
        </div>
      </List>
    </Drawer>
  );
}
