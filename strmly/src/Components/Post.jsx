import React, { useEffect, useState } from "react";
import { Typography, IconButton, Button, useMediaQuery } from "@mui/material";
import { FavoriteOutlined } from "@mui/icons-material";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  getFirestore,
  increment,
} from "firebase/firestore";
import { auth } from "../firebase";
import Thread from "./Thread";

export default function Post({ post, showSnack }) {
  const [liked, setLiked] = useState(false);
  const db = getFirestore();
  const matches = useMediaQuery("(max-width: 800px)");

  const checkIfLiked = async () => {
    if (auth.currentUser) {
      const res = await getDoc(
        doc(db, "likes", auth.currentUser.uid + post.id)
      ).catch((e) => {
       
      });

      if (res.exists()) {
        setLiked(true);
      } else {
        setLiked(false);
      }
    }
  };

  const toggleLike = async () => {
    if (auth.currentUser) {
      if (liked) {
        await updateDoc(doc(db, "post", post.id), {
          likes: increment(-1),
        }).catch((e) => {});
        await deleteDoc(doc(db, "likes", auth.currentUser.uid + post.id));
        setLiked(false);
      } else {
        await updateDoc(doc(db, "post", post.id), {
          likes: increment(1),
        }).catch((e) => {});
        await setDoc(
          doc(db, "likes", auth.currentUser.uid + post.id),
          {}
        ).catch((e) => {});
        setLiked(true);
      }

      setLiked(!liked);
    } else {
      return;
    }
  };

  useEffect(() => {
    checkIfLiked();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        margin: "10px",
        boxShadow: "0px 3px 11px 0px rgba(0,0,0,0.6)",
        padding: "10px",
        maxWidth: matches ? "90%" : "50%",
      }}
    >
      {post.uid == auth.currentUser.uid ? (
        <Button
          sx={{
            color: "#000",
          }}
          onClick={() => {
            deleteDoc(doc(db, "post", post.id)).catch((e) => {});
            showSnack(true);
          }}
        >
          Delete
        </Button>
      ) : (
        <div></div>
      )}
      {post.type.substring(0, 1) == "i" ? (
        <img
          src={post.url}
          style={{
            objectFit: "cover",
            borderRadius: "5px",
            width: "100%",
          }}
        />
      ) : (
        <video
          style={{ borderRadius: "5px", width: "100%" }}
          controls
          controlsList="nodownload"
        >
          <source src={post.url}></source>
        </video>
      )}

      <Typography
        sx={{ wordBreak: "break-word" }}
        style={{ padding: "10px", width: "100%" }}
      >
        {post.caption}
      </Typography>
      {post.likes == 0 ? <div></div> : <Typography>{post.likes}</Typography>}
      <IconButton onClick={toggleLike}>
        <FavoriteOutlined htmlColor={liked ? "#000" : "#b3b3b3"} />
      </IconButton>
      <Thread id={post.id} />
    </div>
  );
}
