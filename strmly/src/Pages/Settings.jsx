import React, { useState, useEffect } from "react";
import SideBar from "../Components/SideBar";
import {
  useMediaQuery,
  CssBaseline,
  IconButton,
  Button,
  Typography,
  TextField,
  Snackbar,
} from "@mui/material";
import { Menu } from "@mui/icons-material";
import MobileMenu from "../Components/MobileMenu";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";

export default function Settings() {
  const matches = useMediaQuery("(max-width: 800px)");
  const [placeholders, setPlaceholers] = useState([]);
  const [tier1, setTier1] = useState("");
  const [tier2, setTier2] = useState("");
  const [tier3, setTier3] = useState("");
  const [open, setOpen] = useState(false);
  const [snack, setSnack] = useState(false);
  const db = getFirestore();
  const navigate = useNavigate();

  const handleClose = (event, reason) => {
    setSnack(false);
  };

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        getPlaceholders();
      } else {
        navigate("/login");
      }
    });
  };

  const getPlaceholders = async () => {
    const res = await getDoc(doc(db, "user", auth.currentUser.uid));

    setPlaceholers([res.get("tier1"), res.get("tier2"), res.get("tier3")]);
    setTier1(res.get("tier1"));
    setTier2(res.get("tier2"));
    setTier3(res.get("tier3"));
  };

  const submitNew = async () => {
    updateDoc(doc(db, "user", auth.currentUser.uid), {
      tier1: tier1,
      tier2: tier2,
      tier3: tier3,
    }).catch((e) => {
    
    });

    setSnack(true);
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
        <Snackbar
          open={snack}
          autoHideDuration={3000}
          onClose={handleClose}
          message="Success :)"
        />

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
          <div
            style={{
              margin: "10px 0 10px 0",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Button
              variant="contained"
              sx={{ backgroundColor: "#000" }}
              onClick={() => navigate("/edit")}
            >
              Edit Profile
            </Button>
            <div style={{ margin: "10px 0" }}></div>
            <Button
              variant="contained"
              sx={{ backgroundColor: "#000" }}
              onClick={() => navigate("/subscriptions")}
            >
              Manage subscriptions
            </Button>
            <div style={{ margin: "10px 0" }}></div>
              <Button
                onClick={() => navigate('/terms')}
                variant="contained"
                sx={{ backgroundColor: "#000" }}
              >
                Terms of Service
              </Button>
            <div style={{ margin: "10px 0" }}></div>
              <Button
                onClick={() => navigate('/privacy')}
                variant="contained"
                sx={{ backgroundColor: "#000" }}
              >
                Privacy Policy
              </Button>
            <hr style={{ color: "#000", width: "100%" }}></hr>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography fontWeight="bold">Tier 1 (5$)</Typography>
              <TextField
                onChange={(e) => setTier1(e.target.value)}
                defaultValue={placeholders[0]}
                multiline
                inputProps={{ maxLength: 200 }}
              ></TextField>
              <div style={{ margin: "10px 0" }}></div>

              <div style={{ margin: "10px 0" }}></div>

              <Typography fontWeight="bold">Tier 2 ($10)</Typography>
              <TextField
                onChange={(e) => setTier2(e.target.value)}
                defaultValue={placeholders[1]}
                multiline
                inputProps={{ maxLength: 200 }}
              ></TextField>
              <div style={{ margin: "10px 0" }}></div>

              <div style={{ margin: "10px 0" }}></div>

              <Typography fontWeight="bold">Tier 3 ($15)</Typography>
              <TextField
                onChange={(e) => setTier3(e.target.value)}
                defaultValue={placeholders[2]}
                multiline
                inputProps={{ maxLength: 200 }}
              ></TextField>
              <div style={{ margin: "10px 0" }}></div>
              <Button
                onClick={submitNew}
                variant="contained"
                sx={{ backgroundColor: "#000" }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
