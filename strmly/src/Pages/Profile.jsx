import React, { useEffect, useState } from "react";
import SideBar from "../Components/SideBar";
import {
  CssBaseline,
  Card,
  Typography,
  useMediaQuery,
  IconButton,
  Button,
  Dialog,
  Slide,
  Snackbar,
} from "@mui/material";
import { Menu } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  updateDoc,
  orderBy,
  where,
  addDoc,
  serverTimestamp,
  increment,
  limit,
  startAfter,
} from "firebase/firestore";
import { auth } from "../firebase";
import MobileMenu from "../Components/MobileMenu";
import axios from "axios";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import Post from "../Components/Post";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function Profile() {
  const matches = useMediaQuery("(max-width: 800px)");
  const stripe = useStripe();
  const elements = useElements();
  const [open, setOpen] = useState(false);
  const [subscribe, setSubscribe] = useState(false);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(true);
  const [openPricing, setOpenPricing] = useState(false);
  const [tier, setTier] = useState("tier1");
  const [card, openCard] = useState(false);
  const [snack, setSnack] = useState(false);
  const [paying, setPaying] = useState(false);
  const [subbed, isSubbed] = useState();
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [last, setLast] = useState(null);
  const navigate = useNavigate();
  const params = useParams();
  const db = getFirestore();

  const getMore = async () => {
    if (auth.currentUser && hasMore) {
      const u = await getDocs(
        query(collection(db, "user"), where("username", "==", params.username))
      );

      if (u.empty) {
        setHasMore(false);
        return;
      }

      const creator = await getDoc(doc(db, "creator", u.docs[0].id));

      if (!creator.exists()) {
        setHasMore(false);
        return;
      }

      const isUser = await getDoc(doc(db, "user", auth.currentUser.uid));

      if (isUser.get("username") == user.username) {
        let pt = [];
        const p = await getDocs(
          query(
            collection(db, "post"),
            where("uid", "==", creator.id),
            where("tier", "<=", 3),
            orderBy("tier", "asc"),
            orderBy("timestamp", "desc"),
            startAfter(last),
            limit(5)
          )
        );

        if (p.empty) {
          setHasMore(false);
          return;
        }

        setLast(p.docs[p.docs.length - 1]);

        for (let i = 0; i < p.docs.length; i++) {
          pt.push({
            url: p.docs[i].get("url"),
            caption: p.docs[i].get("caption"),
            type: p.docs[i].get("type"),
            uid: p.docs[i].get("uid"),
            id: p.docs[i].id,
            likes: p.docs[i].get("likes"),
          });
        }

        setPosts((prev) => [...prev, ...pt]);

        setHasMore(true);

        return;
      }

      const ref = collection(db, "subscriptions");

      const q = query(
        ref,
        where("customer", "==", auth.currentUser.uid),
        where("creator", "==", creator.get("accountId"))
      );

      const docs = await getDocs(q);

      if (docs.empty) {
        setHasMore(false);
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

      const p = await getDocs(
        query(
          collection(db, "post"),
          where("uid", "==", creator.id),
          where("tier", "<=", tier),
          orderBy("tier", "asc"),
          orderBy("timestamp", "desc"),
          startAfter(last),
          limit(5)
        )
      );

      if (p.empty) {
        setHasMore(false);
        return;
      }

      setLast(p.docs[p.docs.length - 1]);

      for (let i = 0; i < p.docs.length; i++) {
        pt.push({
          url: p.docs[i].get("url"),
          caption: p.docs[i].get("caption"),
          type: p.docs[i].get("type"),
          uid: p.docs[i].get("uid"),
          id: p.docs[i].id,
          likes: p.docs[i].get("likes"),
        });
      }

      setHasMore(true);

      setPosts((prev) => [...prev, ...pt]);
    }
  };

  const getLatest = async () => {
    if (auth.currentUser) {
      const u = await getDocs(
        query(collection(db, "user"), where("username", "==", params.username))
      );

      if (u.empty) {
        setHasMore(false);
        return;
      }

      const creator = await getDoc(doc(db, "creator", u.docs[0].id));

      if (!creator.exists()) {
        setHasMore(false);
        return;
      }

      const isUser = await getDoc(doc(db, "user", auth.currentUser.uid));

      if (isUser.get("username") == user.username) {
        let pt = [];
        const p = await getDocs(
          query(
            collection(db, "post"),
            where("uid", "==", creator.id),
            where("tier", "<=", 3),
            orderBy("tier", "asc"),
            orderBy("timestamp", "desc"),
            limit(5)
          )
        );

        if (p.empty) {
          setHasMore(false);
          return;
        }

        setLast(p.docs[p.docs.length - 1]);

        for (let i = 0; i < p.docs.length; i++) {
          pt.push({
            url: p.docs[i].get("url"),
            caption: p.docs[i].get("caption"),
            type: p.docs[i].get("type"),
            uid: p.docs[i].get("uid"),
            id: p.docs[i].id,
            likes: p.docs[i].get("likes"),
          });
        }

        setLast(p.docs[p.docs.length - 1]);

        setPosts(pt);

        setHasMore(true);

        return;
      }

      const ref = collection(db, "subscriptions");

      const q = query(
        ref,
        where("customer", "==", auth.currentUser.uid),
        where("creator", "==", creator.get("accountId"))
      );

      const docs = await getDocs(q);

      if (docs.empty) {
        setHasMore(false);
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

      const p = await getDocs(
        query(
          collection(db, "post"),
          where("uid", "==", creator.id),
          where("tier", "<=", tier),
          orderBy("tier", "asc"),
          orderBy("timestamp", "desc"),
          limit(5)
        )
      );

      if (p.empty) {
        setHasMore(false);
        return;
      }

      setLast(p.docs[p.docs.length - 1]);

      for (let i = 0; i < p.docs.length; i++) {
        pt.push({
          url: p.docs[i].get("url"),
          caption: p.docs[i].get("caption"),
          type: p.docs[i].get("type"),
          uid: p.docs[i].get("uid"),
          id: p.docs[i].id,
          likes: p.docs[i].get("likes"),
        });
      }

      setHasMore(true);

      setPosts(pt);
    }
  };

  const toggleSubscribe = async () => {
    if (auth.currentUser) {
      // todo after payment success
      if (subbed) {
        setSubscribe(true);
        const res = await axios
          .post(
            `api/${auth.currentUser.uid}`
          )
          .catch((e) => {});
        if (res.status == 200) {
          setSnack(true);
          isSubbed(false);
        }
      } else {
        setOpenPricing(true);
      }
    } else {
      navigate("/login");
    }
  };

  const checkIfSubbed = async () => {
    if (auth.currentUser) {
      const isUser = await getDoc(doc(db, "user", auth.currentUser.uid));
      const ref = collection(db, "subscriptions");
      const qry = query(ref, where("customer", "==", auth.currentUser.uid));
      const sub = await getDocs(qry).catch((e) => {});

      if (isUser.get("username") == params.username) {
        isSubbed(true);
        return;
      }

      const res = await axios
        .get(
          `api/${sub.docs[0].id}`
        )
        .catch((e) => {});

      if (res.data == false) {
        isSubbed(false);
        return;
      } else {
        isSubbed(true);
        return;
      }
    }
  };

  const handleSnack = () => {
    setSnack(false);
  };

  const getProfile = async () => {
    const ref = collection(db, "user");

    let snap = await getDocs(
      query(ref, where("username", "==", params.username))
    );

    if (snap.empty) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setPosts([]);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    await getLatest();

    setUser({
      avatar: snap.docs[0].get("avatar"),
      banner: snap.docs[0].get("banner"),
      id: snap.docs[0].id,
      username: snap.docs[0].get("username"),
      bio: snap.docs[0].get('bio'),
      posts: snap.docs[0].get("posts"),
      subscribers: snap.docs[0].get("subscribers"),
      notifications: snap.docs[0].get("notifications"),
      tier1: snap.docs[0].get("tier1"),
      tier2: snap.docs[0].get("tier2"),
      tier3: snap.docs[0].get("tier3"),
    });

    setLoading(false);
    setNotFound(false);
  };

  const handleClose = () => {
    setOpenPricing(false);
  };

  const handlePayClose = () => {
    openCard(false);
  };

  useEffect(() => {
    getProfile();
    checkIfSubbed();
  }, [params.username, loading]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "row" }}>
        <SideBar />
        <MobileMenu open={open} setOpen={setOpen} />
      </div>
    );
  }

  const sub = async (event) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const u = await getDoc(doc(db, "creator", user.id));
    if (!u.exists()) {
      return;
    }

    setPaying(true);

    const res = await axios
      .post(
        `api/${u.get(
          "accountId"
        )}/${auth.currentUser.uid}/${tier}`
      )
      .catch((e) => {});

    const result = await stripe.confirmCardPayment(res.data.clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: user.username,
        },
      },
    });

    if (result.error) {
      setPaying(false);
    } else {
      updateDoc(doc(db, "subscriptions", res.data.subscriptionId), {
        status: "active",
      }).catch((e) => {});
      addDoc(collection(db, "notification"), {
        to: u.id,
        from: auth.currentUser.uid,
        timestamp: serverTimestamp(),
        tier: tier,
      }).catch((e) => {});
      updateDoc(doc(db, "user", u.id), {
        notifications: increment(1),
      });
      setSnack(true);
      openCard(false);
      setPaying(false);
      isSubbed(true);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <SideBar />

      <MobileMenu open={open} setOpen={setOpen} />

      <Dialog
        fullWidth
        maxWidth="md"
        open={card}
        onClose={handlePayClose}
        TransitionComponent={Transition}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <form style={{ width: "100%", padding: "20px" }} id="payment-form">
            <CardElement stripe={stripe} elements={elements} />
            <div style={{ margin: "10px 0" }}></div>
            <Button
              disabled={paying}
              onClick={sub}
              variant="contained"
              sx={{ backgroundColor: "#000" }}
            >
              Pay
            </Button>
          </form>
        </div>
      </Dialog>

      <Dialog
        fullWidth
        maxWidth="md"
        open={openPricing}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <Typography
          style={{ padding: "10px" }}
          fontWeight="bold"
          fontSize="25px"
        >
          Select a Tier
        </Typography>

        <hr style={{ color: "#000", width: "100%" }}></hr>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Card
            style={{
              width: "90%",
              margin: "10px",
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography
              fontWeight="bold"
              fontSize="20px"
              style={{ padding: "10px" }}
            >
              Tier 1
            </Typography>
            <hr style={{ color: "#000", width: "100%" }}></hr>
            <Typography fontWeight="bold" fontSize="20px">
              $5 Monthly
            </Typography>
            <hr style={{ color: "#000", width: "100%" }}></hr>
            <Typography fontWeight="bold">{user.tier1}</Typography>
            <hr style={{ color: "#000", width: "100%" }}></hr>
            <Button
              onClick={() => {
                setTier("tier1");
                openCard(true);
                setOpenPricing(false);
              }}
              variant="contained"
              sx={{ backgroundColor: "#000" }}
            >
              Select
            </Button>
          </Card>

          <div style={{ margin: "10px 0" }}></div>

          <Card
            style={{
              width: "90%",
              margin: "10px",
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography
              fontWeight="bold"
              fontSize="20px"
              style={{ padding: "10px" }}
            >
              Tier 2
            </Typography>
            <hr style={{ color: "#000", width: "100%" }}></hr>
            <Typography fontWeight="bold" fontSize="20px">
              $10 Monthly
            </Typography>
            <hr style={{ color: "#000", width: "100%" }}></hr>
            <Typography fontWeight="bold">{user.tier2}</Typography>
            <hr style={{ color: "#000", width: "100%" }}></hr>
            <Button
              onClick={() => {
                setTier("tier2");
                openCard(true);
                setOpenPricing(false);
              }}
              variant="contained"
              sx={{ backgroundColor: "#000" }}
            >
              Select
            </Button>
          </Card>

          <Card
            style={{
              width: "90%",
              margin: "10px",
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography
              fontWeight="bold"
              fontSize="20px"
              style={{ padding: "10px" }}
            >
              Tier 3
            </Typography>
            <hr style={{ color: "#000", width: "100%" }}></hr>
            <Typography fontWeight="bold" fontSize="20px">
              $15 Monthly
            </Typography>
            <hr style={{ color: "#000", width: "100%" }}></hr>
            <Typography fontWeight="bold">{user.tier3}</Typography>
            <hr style={{ color: "#000", width: "100%" }}></hr>
            <Button
              onClick={() => {
                setTier("tier3");
                openCard(true);
                setOpenPricing(false);
              }}
              variant="contained"
              sx={{ backgroundColor: "#000" }}
            >
              Select
            </Button>
          </Card>
        </div>
      </Dialog>
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
          onClose={handleSnack}
          message="Success :)"
        />
        <div
          style={{
            height: "400px",
            width: "100%",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          {matches ? (
            <IconButton
              onClick={() => setOpen(!open)}
              style={{ position: "absolute", left: "10px", top: "10px" }}
            >
              <Menu style={{ color: "#f5f5f5" }} />
            </IconButton>
          ) : (
            <div></div>
          )}
          <img
            width="100%"
            height="300px"
            src={user.banner}
            style={{ objectFit: "cover" }}
          />
          <Card
            style={{
              width: "200px",
              height: "200px",
              position: "absolute",
              left: "0px",
              right: "0px",
              bottom: "0px",
              margin: "0 auto",
            }}
          >
            <img
              width="200px"
              height="200px"
              src={user.avatar}
              style={{ objectFit: "cover" }}
            />
          </Card>

          <Typography
            variant="h5"
            fontWeight="bold"
            style={{
              margin: matches ? "200px 0 0 0" : "150px 0 0 0",
              padding: "0",
            }}
          >
            {user.username}
          </Typography>
          <Typography
            style={{
              margin: matches ? "50px 0 0 0" : "25px 0 0 0",
              padding: "0",
            }}
          >
            {user.bio}
          </Typography>
          <hr style={{ width: "200px", color: "#000", marginTop: "10px" }} />
          {auth.currentUser && (notFound || user.id == auth.currentUser.uid) ? (
            <Button
              onClick={() => navigate("/settings")}
              sx={{ color: "#fff", backgroundColor:'#000' }}
            >
              Settings
            </Button>
          ) : (
            <Button variant='contained' onClick={toggleSubscribe} sx={{ color: "#fff", backgroundColor:'#000' }}>
              {subbed ? "Unsubscribe" : "Subscribe"}
            </Button>
          )}
          <hr style={{ width: "200px", color: "#000", marginTop: "10px" }} />

          {posts.map((p, i) => {
            return <Post post={p} key={i} showSnack={setSnack} />;
          })}
          <div style={{ padding: "10px" }}></div>

          {hasMore ? <Button onClick={getMore}>Load More</Button> : <div></div>}
          <div style={{ padding: "10px" }}></div>
        </div>
      </div>
    </div>
  );
}
