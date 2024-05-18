import React, { useEffect, useState } from "react";
import {
  Typography,
  Snackbar,
  Button,
  Avatar,
  TextField,
  IconButton,
} from "@mui/material";
import { SendOutlined } from "@mui/icons-material";
import {
  doc,
  deleteDoc,
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  setDoc,
  getDoc,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import { auth } from "../firebase";

export default function Thread({ id }) {
  const [comments, setComment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const db = getFirestore();

  const getComments = async () => {
    const ref = collection(db, "comment");
    const q = query(
      ref,
      where("postId", "==", id),
      orderBy("timestamp", "desc")
    );
    const cmts = await getDocs(q).catch((e) => {});

    if (cmts.empty) {
      setLoading(false);
      return;
    } else {
      let c = [];
      for (let i = 0; i < cmts.docs.length; i++) {
        c.push({
          id: cmts.docs[i].id,
          text: cmts.docs[i].get("text"),
          username: cmts.docs[i].get("username"),
          avatar: cmts.docs[i].get("avatar"),
          timestamp: cmts.docs[i].get("timestamp"),
          uid: cmts.docs[i].get("uid"),
        });
      }
      setComment(c);
      setLoading(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    getComments();
  }, [loading]);

  const handleSnack = () => {
    setOpen(false);
  };

  const handleInputChange = (event) => {
    setText(event.target.value);
  };

  const send = async () => {
    if (text == "") {
      return;
    }
    const user = await getDoc(doc(db, "user", auth.currentUser.uid));
    await addDoc(collection(db, "comment"), {
      text: text,
      username: user.get("username"),
      avatar: user.get("avatar"),
      timestamp: serverTimestamp(),
      uid: auth.currentUser.uid,
      postId: id,
    }).catch((e) => {});

    setOpen(true);
    setText("");
  };

  if (loading) {
    return <div></div>;
  }

  return (
    <div>
      {comments.map((c, i) => {
        return (
          <div
            style={{
              padding: "10px",
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
            }}
            key={c.id}
          >
            <Snackbar
              open={open}
              autoHideDuration={3000}
              onClose={handleSnack}
              message="Success :)"
            />
            <Avatar src={c.avatar} />
            <div style={{ marginLeft: "10px" }}></div>
            <Typography
              style={{ marginTop: "10px" }}
              sx={{ wordBreak: "break-word" }}
            >
              {c.text}
            </Typography>
            <div style={{ flexGrow: "1" }}></div>
            {c.uid == auth.currentUser.uid ? (
              <Button
                sx={{ color: "#000" }}
                onClick={() => {
                  deleteDoc(doc(db, "comment", c.id));
                  setOpen(true);
                }}
              >
                Delete
              </Button>
            ) : (
              <div></div>
            )}
          </div>
        );
      })}
      <div>
        <TextField
          multiline
          value={text}
          placeholder="Post a comment"
          inputProps={{ maxLength: "200" }}
          onChange={handleInputChange}
        ></TextField>
        <IconButton onClick={send}>
          <SendOutlined />
        </IconButton>
      </div>
    </div>
  );
}
