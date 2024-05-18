import React, { useEffect, useState } from "react";
import { Avatar, Typography } from "@mui/material";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Bottom() {
  const [username, setUsername] = useState("");
  const [pic, setPic] = useState("");

  const db = getFirestore();
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const res = await getDoc(doc(db, "user", auth.currentUser.uid)).catch(
          (e) => {
           
          }
        );

        setUsername(res.get("username"));
        setPic(res.get("avatar"));
      } else {
      }
    });
  };

  return (
    <div
      onClick={() => navigate(`/${username}`)}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        margin: "10px 0 20px 10px",
      }}
    >
      <Avatar src={pic} style={{ marginRight: "10px" }}></Avatar>
      <Typography style={{ color: "#000" }}>{username}</Typography>
    </div>
  );
}
