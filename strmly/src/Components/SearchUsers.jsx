import { CssBaseline, TextField, Container } from "@mui/material";
import { useCallback } from "react";
import { useSearchBox } from "react-instantsearch";

export default function MySearchBox(props) {
  // create you query hook using useCallback
  const memoizedSearch = useCallback((query, search) => {
    search(query);
  }, []);

  // use your new query hook
  const { refine } = useSearchBox({
    queryHook: memoizedSearch,
  });

  const handleChange = (event) => {
    refine(event.target.value);
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />

      <TextField
        placeholder="Search creators & topics"
        onChange={handleChange}
        sx={{ margin: "10px", padding: 2, width: "300px", minHeight: "48px" }}
      ></TextField>
    </Container>
  );
}