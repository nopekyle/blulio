import { React } from "react";
import {
  Container,
  CssBaseline,
  Avatar,
  Paper,
  Typography,
  Grid,
} from "@mui/material";
import algoliasearch from "algoliasearch/lite";
import { Hits, InstantSearch, Configure } from "react-instantsearch";
import SearchUsers from "./SearchUsers";
import { useNavigate } from "react-router-dom";

const algoliaClient = algoliasearch("your algolia credentials");

const searchClient = {
  ...algoliaClient,
  search(requests) {
    if (requests.every(({ params }) => !params.query)) {
      return Promise.resolve({
        results: requests.map(() => ({
          hits: [],
          nbHits: 0,
          nbPages: 0,
          page: 0,
          processingTimeMS: 0,
          hitsPerPage: 0,
          exhaustiveNbHits: false,
          query: '',
          params: '',
        })),
      });
    }

    console.log(requests)

    return algoliaClient.search(requests);
  },
};

function Hit({ hit }) {
  const navigator = useNavigate();

  function goToProfile(username) {
    navigator(`/${username}`);
  }

  return (
    <Paper
      onClick={() => goToProfile(hit.username)}
      sx={{
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        margin: "10px",
        width: "300px",
        padding: 2,
      }}
    >
      <Avatar src={hit.avatar} style={{ marginRight: "10px" }}></Avatar>
      <Typography style={{ marginRight: "10px" }}>/ @{hit.username}</Typography>
      <Typography style={{marginRight:'10px'}}>/ {hit.bio}</Typography>
    </Paper>
  );
}

function SearchPage() {
  return (
    <Container component="main" maxWidth="xs">
      <InstantSearch searchClient={searchClient} indexName="search_blulio">
        <CssBaseline />
        <Grid
          container
          direction="column"
          justifyContent="center"
          alignItems="center"
        >
          <Grid item alignSelf="center">
            <SearchUsers />
          </Grid>
          <Grid item alignContent="center">
            <Hits hitComponent={Hit} classNames={{ list: "custom-list" }} />
          </Grid>
        </Grid>
        <div style={{ marginBottom: "40px" }}></div>
      </InstantSearch>
    </Container>
  );
}

export default SearchPage;
