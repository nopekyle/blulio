import React, { useState, useEffect } from "react";
import SideBar from "../Components/SideBar";
import {
  CssBaseline,
  Card,
  Typography,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import { Menu } from "@mui/icons-material";
import { auth } from "../firebase";
import MobileMenu from "../Components/MobileMenu";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  getDocs,
  where,
  getDoc,
  doc,
  getFirestore,
} from "firebase/firestore";

export default function Home() {
  const navigate = useNavigate();
  const db = getFirestore();
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getData();
  }, [loading]);

  const getData = async () => {
    if (auth.currentUser) {
      const ref = collection(db, "subscriptions");

      const q = query(ref, where("customer", "==", auth.currentUser.uid));

      const docs = await getDocs(q);

      if (docs.empty) {
        setSubs([]);
        setLoading(false);
        return;
      }
      let usr = [];

      for (let i = 0; i < docs.docs.length; i++) {
        const creator = await getDocs(
          query(
            collection(db, "creator"),
            where("accountId", "==", docs.docs[i].get("creator"))
          )
        );

        const u = await getDoc(doc(db, "user", creator.docs[i].id));

        usr.push({
          avatar: u.get("avatar"),
          banner: u.get("banner"),
          username: u.get("username"),
        });
      }

      setSubs(usr);
      setLoading(false);
    } else {
      navigate("/login");
    }
  };

  const matches = useMediaQuery("(max-width: 800px)");
  const [open, setOpen] = useState(false);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "row" }}>
        <SideBar />
        <MobileMenu open={open} setOpen={setOpen} />
      </div>
    );
  }

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
        {subs.map((s, i) => {
          return (
            <div
              key={i}
              style={{
                width: "100%",
                marginTop: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Card
                onClick={() => navigate(`/${s.username}`)}
                style={{
                  width: "200px",
                  height: "200px",
                }}
              >
                <img
                  width="200px"
                  height="200px"
                  src={s.avatar}
                  style={{ objectFit: "cover" }}
                />
              </Card>

              <Typography
                variant="h5"
                fontWeight="bold"
                style={{
                  margin: matches ? "20px 0 0 0" : "20px 0 0 0",
                  padding: "0",
                  color: "#000",
                }}
              >
                {s.username}
              </Typography>
              <hr
                style={{ width: "200px", color: "#000", marginTop: "20px" }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
