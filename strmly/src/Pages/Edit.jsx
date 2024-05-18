import React, { useEffect, useState } from "react";
import {
  Button,
  CssBaseline,
  Snackbar,
  Avatar,
  Container,
  TextField,
} from "@mui/material";
import { getAuth } from "firebase/auth";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Edit() {
  const [coverPic, setCoverPic] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [coverTemp, setCoverTemp] = useState(null);
  const [profileTemp, setProfileTemp] = useState(null);
  const [open, setOpen] = useState(false);
  const [pickedAvatar, setPickedAvatar] = useState(null);
  const [pickedCover, setPickedCover] = useState(null);
  const [bio, setBio] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
      } else {
        navigate("/login");
      }
    });
  };

  const db = getFirestore();
  const auth = getAuth();

  const handleClose = (event, reason) => {
    setOpen(false);
  };

  const handleCoverSelection = (event) => {
    const selectedFile = URL.createObjectURL(event.target.files[0]);
    setPickedCover(event.target.files[0]);
    setCoverTemp(selectedFile);
  };

  const handleProfileSelection = (event) => {
    const selectedFile = URL.createObjectURL(event.target.files[0]);
    setPickedAvatar(event.target.files[0]);
    setProfileTemp(selectedFile);
  };

  const uploadAvatar = async () => {
    if (!pickedAvatar) {
      return;
    }

    const imageRef = ref(storage, `images/${Date.now()}`);

    const metadata = {
      contentType: "image/png",
    };

    uploadBytes(imageRef, pickedAvatar, metadata)
      .then((snap) => {
        getDownloadURL(snap.ref)
          .then(async (url) => {
            const ref = doc(db, "user", auth.currentUser.uid);
            const res = await updateDoc(ref, {
              avatar: url,
            }).catch((e) => {});
          })
          .catch((e) => {});
        setOpen(true);
      })
      .catch((e) => {});
  };

  const uploadCover = async () => {
    if (!pickedCover) {
      return;
    }

    const imageRef = ref(storage, `images/${Date.now()}`);

    const metadata = {
      contentType: "image/png",
    };

    uploadBytes(imageRef, pickedCover, metadata)
      .then((snap) => {
        getDownloadURL(snap.ref)
          .then(async (url) => {
            const ref = doc(db, "user", auth.currentUser.uid);
            const res = await updateDoc(ref, {
              banner: url,
            }).catch((e) => {});
          })
          .catch((e) => {});
        setOpen(true);
      })
      .catch((e) => {});
  };

  const getUser = async () => {
    const ref = doc(db, "user", auth.currentUser.uid);
    const user = await getDoc(ref).catch((e) => {});

    setCoverPic(user.get("banner"));
    setProfilePic(user.get("avatar"));
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <Container component="main" maxWidth="md">
      <CssBaseline />
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        message="Success :)"
      />
      <div
        style={{
          backgroundImage: `url('${coverTemp == null ? coverPic : coverTemp}')`,
          height: "180px",
          position: "relative",
          backgroundSize: "cover",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Avatar
          src={`${profileTemp == null ? profilePic : profileTemp}`}
          sx={{
            width: "90px",
            height: "90px",
          }}
        ></Avatar>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div>
          <label htmlFor="fileInput">
            <Button component="span">Select Avatar</Button>
          </label>
          <input
            accept="image/*"
            id="fileInput"
            type="file"
            style={{ display: "none" }}
            onChange={handleProfileSelection}
          />
        </div>
        <div>
          <label htmlFor="fileInputCover">
            <Button component="span">Select Banner</Button>
          </label>
          <input
            accept="image/*"
            id="fileInputCover"
            type="file"
            style={{ display: "none" }}
            onChange={handleCoverSelection}
          />
        </div>
        <Button
          onClick={() => {
            setCoverTemp(null);
            setProfileTemp(null);
          }}
        >
          Reset
        </Button>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <Button
          onClick={async () => {
            await uploadAvatar();
            setPickedAvatar(null);
          }}
        >
          Save Avatar
        </Button>
        <Button
          onClick={async () => {
            await uploadCover();
            setPickedCover(null);
          }}
        >
          Save Banner
        </Button>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <TextField
          inputProps={{ maxLength: "50" }}
          placeholder="Content Description"
          onChange={(e) => {
            setBio(e.target.value);
          }}
        />
        <Button
          onClick={async () => {
            await updateDoc(doc(db, "user", auth.currentUser.uid), {
              bio: bio,
            }).catch((e) => {});
            setOpen(true);
          }}
        >
          Save Description
        </Button>
      </div>
    </Container>
  );
}
