import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { Container, Snackbar } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  increment,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © Mimefly Inc."}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const defaultTheme = createTheme();

export default function Register() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleError = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    setOpen(false);
  };

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        navigate("/");
      } else {
      }
    });
  };

  const [validationError, setValidationError] = useState("");

  const handleInputChange = (event) => {
    const newValue = event.target.value;

    const regex = /^[a-zA-Z0-9]+$/;

    if (!regex.test(newValue)) {
      setValidationError("Input must be alphanumeric with no whitespace.");
    } else {
      setValidationError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    try {
      const db = getFirestore();

      // check if username exists
      let username = data.get("username").trim().toLowerCase();

      const ref = collection(db, "user");

      const q = query(ref, where("username", "==", username));

      const querySnapshot = await getDocs(q);

      // return if username exists

      if (querySnapshot.size > 0) {
        setError("Username is taken");
        handleError();
        return;
      }

      if (
        username.toLowerCase() == "login" ||
        username.toLowerCase() == "register" ||
        username.toLowerCase() == "notifications" ||
        username.toLowerCase() == "settings" ||
        username.toLowerCase() == "subscriptions" ||
        username.toLowerCase() == "upload" ||
        username.toLowerCase() == "edit" ||
        username.toLowerCase() == "terms" ||
        username.toLowerCase() == "privacy" ||
        username.toLowerCase() == "failed"
      ) {
        setError("Username is not available");
        handleError();
        return;
      }

      // try to sign up

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.get("email"),
        data.get("password")
      );

      const uid = userCredential.user.uid;

      await setDoc(doc(db, "user", uid), {
        posts: 0,
        subscribers: 0,
        avatar: "",
        username: username,
        notifications: 0,
        banner: "",
        tier1: "",
        tier2: "",
        tier3: "",
        bio: ""
      });

      await setDoc(
        doc(db, "statistics", "users"),
        {
          count: increment(1),
        },
        { merge: true }
      );

      sendEmailVerification(userCredential.user);

      navigate("/");
    } catch (e) {
      handleError();
      setError(e.toString());
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />
        <Snackbar
          open={open}
          autoHideDuration={3000}
          onClose={handleClose}
          message={error}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={0} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              
            }}
          >
            <Typography fontWeight="bold" variant="h3">
              blulio
            </Typography>
            <Typography>Get paid for your content.</Typography>
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{ mt: 1 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoFocus
                onChange={handleInputChange}
                error={Boolean(validationError)}
                helperText={validationError}
                inputProps={{ maxLength: 15 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                inputProps={{ maxLength: 100 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                inputProps={{ maxLength: 100 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, backgroundColor: "#000" }}
              >
                Register
              </Button>
              <Grid container>
                {/* <Grid item xs>
                  <Link href="#" variant="body2">
                    Forgot password?
                  </Link>
                </Grid> */}
                <Grid item>
                  <Link href="/login" variant="body2">
                    {"Already have an account? Login here"}
                  </Link>
                </Grid>
              </Grid>
              <Copyright sx={{ mt: 5 }} />
            </Box>
          </Box>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}
