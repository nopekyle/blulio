import React, { useState, useEffect } from "react";
import SideBar from "../Components/SideBar";
import {
  Typography,
  useMediaQuery,
  CssBaseline,
  Card,
  IconButton,
} from "@mui/material";
import { Menu } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import MobileMenu from "../Components/MobileMenu";
import { auth } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";

export default function Notifications() {
  const navigate = useNavigate();
  const db = getFirestore();
  const [notifications, setNotifications] = useState([]);
  const matches = useMediaQuery("(max-width: 800px)");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const notis = await getDocs(
          query(
            collection(db, "notification"),
            where("to", "==", user.uid),
            orderBy("timestamp", "desc"),
            limit(50)
          )
        ).catch((e) => {});

        if (notis.empty) {
          return;
        }

        let n = [];

        for (let i = 0; i < notis.docs.length; i++) {
          const u = await getDoc(
            doc(db, "user", notis.docs[i].get("from"))
          ).catch((e) => {});
          n.push({
            avatar: u.get("avatar"),
            username: u.get("username"),
            message: `${u.get("username")} subscribed at tier ${notis.docs[i]
              .get("tier")
              .substring(4)}! :)`,
          });
        }

        setNotifications(n);
      } else {
        navigate("/login");
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <SideBar />

      <MobileMenu open={open} setOpen={setOpen} />

      <div
        style={{
          paddingLeft: matches ? "0" : "300px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <CssBaseline />
        <div
          style={{
            height: "auto",
            width: "100%",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {matches ? (
            <IconButton
              onClick={() => setOpen(!open)}
              style={{ position: "absolute", left: "10px", top: "10px" }}
            >
              <Menu style={{ color: "#000" }} />
            </IconButton>
          ) : (
            <div></div>
          )}
          <div style={{ margin: "10px 0 10px 0" }}>
            {notifications.map((n, i) => {
              return (
                <Card key={i}>
                  <Typography style={{ padding: "10px", color: "#000" }}>
                    {n.message}
                  </Typography>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
