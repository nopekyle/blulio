import React, { useState, useEffect } from "react";
import SideBar from "../Components/SideBar";
import {
  useMediaQuery,
  CssBaseline,
  IconButton,
  Button,
  TextField,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Snackbar,
  CircularProgress,
  Typography,
} from "@mui/material";
import { Menu } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import MobileMenu from "../Components/MobileMenu";
import { useNavigate } from "react-router-dom";
import { auth, storage } from "../firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  increment,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import axios from "axios";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export default function Upload() {
  const matches = useMediaQuery("(max-width: 800px)");
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [tier, setTier] = useState(1);
  const [sending, setSending] = useState(false);
  const [snack, setSnack] = useState(false);
  const [upload, setUpload] = useState(false);
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [login, setLogin] = useState(false);
  const [type, setType] = useState("");
  const [progress, setProgress] = useState(0);
  const [name, setName] = useState(null);
  const db = getFirestore();

  const navigate = useNavigate();

  const reset = () => {
    deleteDoc(doc(db, "creator", auth.currentUser.uid))
      .catch((e) => {})
      .then(() => {
        window.location.reload();
      });
  };

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const acc = await getDoc(doc(db, "creator", user.uid));
        if (acc.exists()) {
          const check = await axios.get(
            `api/${acc.get(
              "accountId"
            )}`
          ).catch((e) => {
          });

          if (check.data == true) {
            setComplete(true);
            setUpload(true);
            setLoading(false);
          } else {
            setComplete(false);
            setUpload(false);
            setLoading(false);
            setLogin(true);
          }
        } else {
          setComplete(false);
          setUpload(false);
          setLoading(false);
        }
      } else {
        navigate("/login");
      }
    });
  };

  const onboard = () => {
    axios
      .post(
        `api/${auth.currentUser.uid}`
      )
      .catch((e) => {})
      .then((res) => {
        window.location.href = res.data;
      });
  };

  const handleClose = (event, reason) => {
    setSnack(false);
  };

  const fileChange = (e) => {
    const current = e.target.files[0];
    setFile(current);
    setName(e.target.files[0].name);
    setType(e.target.files[0].type);
  };

  const handleClick = () => {
    if (file === null) return;
    const fileRef = ref(storage, `videos/${Date.now()}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    setSending(true);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      },
      (error) => {
        
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          addDoc(collection(db, "post"), {
            uid: auth.currentUser.uid,
            url: url,
            timestamp: serverTimestamp(),
            caption: caption,
            tier: tier,
            type: type,
            likes: 0
          }).catch((e) => {});

          updateDoc(doc(db, "user", auth.currentUser.uid), {
            posts: increment(1),
          }).catch((e) => {});
          setSending(false);
          setSnack(true);
        });
      }
    );
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "row" }}>
        <SideBar />
        <MobileMenu open={open} setOpen={setOpen} />
      </div>
    );
  }

  if (!upload || !complete) {
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
            <div
              style={{
                margin: "10px 0 10px 0",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {login ? (
                <div
                  style={{
                    margin: "10px 0 10px 0",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <form>
                    <Button
                      onClick={() => {
                        window.location.href =
                          "https://connect.stripe.com/express_login";
                      }}
                      component="label"
                      variant="contained"
                      sx={{
                        backgroundColor: "#000",
                      }}
                    >
                      Pending Verification...or Login to Stripe to continue onboarding
                    </Button>
                  </form>

                  <div style={{ margin: "10px 0" }}></div>

                  <form>
                    <Button
                      onClick={() => reset()}
                      component="label"
                      variant="contained"
                      sx={{
                        backgroundColor: "#000",
                      }}
                    >
                      Reset and Try Again
                    </Button>
                  </form>
                </div>
              ) : (
                <form>
                  <Button
                    type="submit"
                    onClick={() => onboard()}
                    component="label"
                    variant="contained"
                    sx={{
                      backgroundColor: "#000",
                    }}
                  >
                    Connect With Stripe to Get Paid
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
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
            <TextField
              placeholder="Description"
              onChange={(e) => setCaption(e.target.value)}
              inputProps={{ maxLength: 1000 }}
              multiline
            ></TextField>
            <div style={{ margin: "10px 0 10px 0" }}></div>
            <hr style={{ width: "100%", color: "#000" }}></hr>
            <Typography>{name}</Typography>
            <div style={{ margin: "10px 0 10px 0" }}></div>
            <Button
              onChange={fileChange}
              component="label"
              variant="contained"
              sx={{
                backgroundColor: "#000",
              }}
              startIcon={<CloudUploadIcon />}
            >
              Upload file
              <VisuallyHiddenInput type="file" accept="video/*, image/*" />
            </Button>
            <div style={{ margin: "10px 0 10px 0" }}></div>
            <hr style={{ width: "100%", color: "#000" }}></hr>
            <div style={{ margin: "10px 0 10px 0" }}></div>

            <FormControl>
              <RadioGroup
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                value={tier}
              >
                <FormControlLabel
                  onChange={() => setTier(1)}
                  defaultChecked
                  value={1}
                  control={<Radio />}
                  label="Tier One"
                />
                <FormControlLabel
                  onChange={() => setTier(2)}
                  value={2}
                  control={<Radio />}
                  label="Tier Two"
                />
                <FormControlLabel
                  onChange={() => setTier(3)}
                  value={3}
                  control={<Radio />}
                  label="Tier Three"
                />
              </RadioGroup>
            </FormControl>

            <div style={{ margin: "10px 0 10px 0" }}></div>
            <hr style={{ width: "100%", color: "#000" }}></hr>
            <div style={{ margin: "10px 0 10px 0" }}></div>

            {sending ? (
              <div>
                <CircularProgress size={20} />
                <Typography style={{color:'#000'}}>This may take awhile! Don't leave :) / {progress}% complete</Typography>
              </div>
            ) : (
              <Button
                disabled={sending}
                onClick={handleClick}
                variant="contained"
                sx={{ backgroundColor: "#000" }}
              >
                Post
              </Button>
            )}
          </div>
          <form>
            <Button
              onClick={() => {
                window.location.href =
                  "https://connect.stripe.com/express_login";
              }}
              component="label"
              variant="contained"
              sx={{
                backgroundColor: "#000",
              }}
            >
              Login into your stripe account
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
