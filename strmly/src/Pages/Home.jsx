import React, { useState, useEffect } from "react";
import SideBar from "../Components/SideBar";
import {
  CssBaseline,
  Card,
  Typography,
  useMediaQuery,
  IconButton,
  CardMedia,
  Button,
  Skeleton,
} from "@mui/material";
import { Menu } from "@mui/icons-material";
import { auth } from "../firebase";
import MobileMenu from "../Components/MobileMenu";
import { useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  where,
  startAt,
} from "firebase/firestore";
import SearchResults from "../Components/Search";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const matches = useMediaQuery("(max-width: 800px)");
  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const db = getFirestore();

  useEffect(() => {
    getData();
  }, [loading]);

  const getLatest = async () => {
    // get subscriptions
    const ref = collection(db, "subscriptions");

    const q = query(ref, where("customer", "==", auth.currentUser.uid));

    const docs = await getDocs(q);

    if (docs.empty) {
      return;
    }

    let pt = [];
    let tier = 1;
    if (docs.docs[0].get("tier") == "tier1") {
      tier = 1;
    } else if (docs.docs[0].get("tier") == "tier2") {
      tier = 2;
    } else {
      tier = 3;
    }

    for (let i = 0; i < docs.docs.length; i++) {
      const creator = await getDocs(
        query(
          collection(db, "creator"),
          where("accountId", "==", docs.docs[i].get("creator"))
        )
      );

      const p = await getDocs(
        query(
          collection(db, "post"),
          where("uid", "==", creator.docs[0].id),
          orderBy("tier", "asc"),
          orderBy("timestamp", "desc")
        )
      );

      if (p.empty) {
        return;
      }

      const u = await getDoc(doc(db, "user", creator.docs[0].id));
      pt.push({
        url: p.docs[i].get("url"),
        username: u.get("username"),
        avatar: u.get("avatar"),
        caption: p.docs[i].get("caption"),
        type: p.docs[i].get("type"),
      });
    }

    setPosts(pt);
  };

  const getData = async () => {
    if (auth.currentUser) {
      await getLatest();
      setLoading(false);
    } else {
      navigate("/login");
      setLoading(false);
    }
  };

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
        <div
          style={{
            width: "100%",
            marginTop: "20px",
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

          {posts.length != 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Card
                style={{
                  width: "200px",
                  height: "200px",
                }}
              >
                <img
                  width="200px"
                  height="200px"
                  src={posts[0].avatar}
                  style={{ objectFit: "cover" }}
                />
              </Card>

              <Typography
                variant="h5"
                fontWeight="bold"
                style={{
                  margin: matches ? "20px 0 0 0" : "20px 0 0 0",
                  padding: "0",
                }}
              >
                {posts[0].username}
              </Typography>
              <hr style={{ width: "200px", color: "#000", margin: "20px 0" }} />
              <Typography
                sx={{ wordBreak: "break-word" }}
                style={{ padding: "10px", width: "100%" }}
              >
                {posts[0].caption}
              </Typography>
              <hr style={{ width: "200px", color: "#000", margin: "20px 0" }} />

              {posts[0].type.substring(0, 1) == "i" ? (
                <img
                  src={posts[0].url}
                  width="90%"
                  height="90%"
                  style={{ objectFit: "cover", borderRadius: "5px" }}
                />
              ) : (
                <video
                  style={{ borderRadius: "5px" }}
                  controls
                  width="90%"
                  height="90%"
                  controlsList="nodownload"
                >
                  <source src={posts[0].url}></source>
                </video>
              )}

              <hr style={{ width: "200px", color: "#000", margin: "20px 0" }} />
              <Button
                onClick={() => navigate(`/${posts[0].username}`)}
                sx={{ backgroundColor: "#000", color: "#fff" }}
              >
                See More
              </Button>
              <hr style={{ width: "200px", color: "#000", margin: "20px 0" }} />
            </div>
          ) : (
            <div
              style={{
                marginTop:'50px',
                padding:'10px'
              }}
            >
               <SearchResults/>
              <Typography>
                Hi. Once you start subscribing to creators, you will see their
                most recent posts here :)
              </Typography>
              
             
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
